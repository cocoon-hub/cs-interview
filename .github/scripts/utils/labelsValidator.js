const issue = context.payload.issue;
const labels = issue.labels || [];

if (labels.length !== 0) {
  console.log('label을 하나 이상 추가해야만 합니다.');

  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue.number,
    state: 'open',
  });
  throw new Error('라벨 없음 - 이슈 재오픈 후 워크플로우 종료');
}
