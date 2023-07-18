from decouple import config
import boto3

s3 = boto3.client('s3',
                  aws_access_key_id=config('AWS_ACCESS_KEY'),
                  aws_secret_access_key=config('AWS_SECRET_KEY'),
                  region_name=config('AWS_RIGION_NAME'))