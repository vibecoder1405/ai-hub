from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build
from src.config.settings import YOUTUBE_API_KEY, PREFERRED_LANGUAGES
from datetime import datetime, timedelta

class YouTubeService:
    def __init__(self):
        self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

    def get_video_id(self, url):
        """Extract video ID from YouTube URL"""
        if 'youtu.be' in url:
            return url.split('/')[-1].split('?')[0]
        elif 'youtube.com' in url:
            if 'v=' in url:
                return url.split('v=')[1].split('&')[0]
            elif 'embed/' in url:
                return url.split('embed/')[-1].split('?')[0]
        return None

    def get_video_details(self, video_id):
        """Get video details using YouTube Data API"""
        try:
            # Get video details
            video_response = self.youtube.videos().list(
                part='snippet,statistics',
                id=video_id
            ).execute()
            
            if not video_response['items']:
                return None
                
            video_data = video_response['items'][0]
            
            # Get channel details
            channel_id = video_data['snippet']['channelId']
            channel_response = self.youtube.channels().list(
                part='snippet,statistics',
                id=channel_id
            ).execute()
            
            channel_data = channel_response['items'][0]
            
            return {
                'title': video_data['snippet']['title'],
                'thumbnail': video_data['snippet']['thumbnails']['high']['url'],
                'channel_name': channel_data['snippet']['title'],
                'channel_subscribers': int(channel_data['statistics']['subscriberCount']),
                'video_views': int(video_data['statistics']['viewCount']),
                'video_likes': int(video_data['statistics'].get('likeCount', 0)),
                'published_date': video_data['snippet']['publishedAt']
            }
        except Exception as e:
            raise Exception(f"Error fetching video details: {str(e)}")

    def get_video_comments(self, video_id):
        """Get video comments using YouTube Data API"""
        try:
            comments = []
            request = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=100
            )
            
            while request and len(comments) < 100:
                response = request.execute()
                
                for item in response['items']:
                    comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                    comments.append(comment)
                    
                request = self.youtube.commentThreads().list_next(request, response)
                
            return comments[:100]
        except Exception as e:
            raise Exception(f"Error fetching comments: {str(e)}")

    def get_transcript(self, video_id):
        """Get transcript from YouTube video"""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to find transcript in preferred languages
            for lang_code in PREFERRED_LANGUAGES:
                try:
                    transcript = transcript_list.find_transcript([lang_code])
                    return ' '.join([entry['text'] for entry in transcript.fetch()])
                except:
                    continue
            
            # If no manual transcript found, try auto-generated ones
            try:
                transcript = transcript_list.find_manually_created_transcript()
                return ' '.join([entry['text'] for entry in transcript.fetch()])
            except:
                # If no manual transcript, try auto-generated ones
                try:
                    transcript = transcript_list.find_generated_transcript(PREFERRED_LANGUAGES)
                    return ' '.join([entry['text'] for entry in transcript.fetch()])
                except:
                    # If still no transcript, try to translate from any available language
                    try:
                        transcript = transcript_list.find_transcript(['en'])
                        return ' '.join([entry['text'] for entry in transcript.fetch()])
                    except:
                        return "Error: No transcripts found for this video. Please try a different video."
                        
        except Exception as e:
            return f"Error getting transcript: {str(e)}"

    def get_trending_videos(self, category_id=None, max_results=5):
        """Get trending videos from YouTube.
        
        Args:
            category_id (str, optional): YouTube video category ID. Defaults to None.
            max_results (int, optional): Maximum number of results to return. Defaults to 5.
        """
        try:
            request_params = {
                "part": "snippet,statistics",
                "chart": "mostPopular",
                "regionCode": "US",
                "maxResults": max_results
            }
            
            if category_id:
                request_params["videoCategoryId"] = category_id
            
            request = self.youtube.videos().list(**request_params)
            response = request.execute()
            trending_videos = []
            
            for item in response['items']:
                video_id = item['id']
                snippet = item['snippet']
                statistics = item['statistics']
                
                # Get channel details
                channel_id = snippet['channelId']
                channel_request = self.youtube.channels().list(
                    part="statistics",
                    id=channel_id
                )
                channel_response = channel_request.execute()
                channel_stats = channel_response['items'][0]['statistics']
                
                trending_videos.append({
                    'video_id': video_id,
                    'title': snippet['title'],
                    'thumbnail': snippet['thumbnails']['high']['url'],
                    'channel_name': snippet['channelTitle'],
                    'channel_subscribers': int(channel_stats.get('subscriberCount', 0)),
                    'video_views': int(statistics.get('viewCount', 0)),
                    'video_likes': int(statistics.get('likeCount', 0)),
                    'published_date': snippet['publishedAt']
                })
            
            return trending_videos
        except Exception as e:
            print(f"Error fetching trending videos: {str(e)}")
            return [] 