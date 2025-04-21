export function parseQuestions(issueBody, startNumber = 1) {
  return issueBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, idx) => ({
      title: `${startNumber + idx + 1}. ${line}`,
      body: line,
    }));
}
