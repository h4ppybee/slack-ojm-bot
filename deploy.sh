zip -r function.zip .

aws lambda update-function-code \
    --function-name slack-noti \
    --zip-file fileb://function.zip \
    --region us-east-2 \
    --no-cli-pager

echo "Waiting for Lambda to be active..."
sleep 5

export $(grep -v '^#' .env | xargs)
aws lambda update-function-configuration \
    --function-name slack-noti \
    --environment "Variables={SLACK_BOT_OAUTH_TOKEN=$SLACK_BOT_OAUTH_TOKEN,GOOGLE_SHEET=$GOOGLE_SHEET,SQS_URL=$SQS_URL}" \
    --region us-east-2 \
    --no-cli-pager