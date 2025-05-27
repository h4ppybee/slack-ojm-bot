set -e

# 소스코드 배포
zip -r function.zip .

aws lambda update-function-code \
    --function-name slack-noti \
    --zip-file fileb://function.zip \
    --region us-east-2 \
    --no-cli-pager \
    --profile dev

echo "Waiting for Lambda to be active..."
sleep 5

# 환경변수 배포
ENV_VARS=$(grep -v '^#' .env | paste -sd, -)
aws lambda update-function-configuration \
    --function-name slack-noti \
    --environment "Variables={$ENV_VARS}" \
    --region us-east-2 \
    --no-cli-pager \
    --profile dev

if [ $? -eq 0 ]; then
    echo -e "\033[1;32m✅ 환경변수 배포\033[0m"
    aws lambda get-function-configuration \
        --function-name slack-noti \
        --query 'Environment.Variables' \
        --profile dev \
        --region us-east-2 \
        --output json | jq -r 'to_entries[] | "\u001b[32m\(.key)=\(.value)\u001b[0m"' 
else
    echo -e "\033[1;31m❌ 환경변수 배포 실패\033[0m"
fi