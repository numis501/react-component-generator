---
name: creator-pr
description: |
  현재 브랜치의 변경사항을 분석해 템플릿에 맞는 GitHub Pull Request를 생성한다.
  "PR 만들어줘", "PR 올려줘", "풀리퀘스트 생성", "create pr", "open a pull request", "/creator-pr" 같은 요청에 활성화한다.
  사용자가 커밋 후 리뷰를 요청하거나 브랜치를 올려 병합을 준비하려는 맥락이면 PR을 명시하지 않아도 이 스킬을 사용한다.
  서브 에이전트(context: fork)에서 실행되어 메인 대화의 컨텍스트를 오염시키지 않는다.
context: fork
agent: general-purpose
allowed-tools: Bash(git *), Bash(gh *), Read, Grep, Glob
---

# creator-pr: 서브 에이전트에서 PR 생성

이 스킬은 격리된 서브 에이전트에서 실행되므로 이전 대화 내용을 볼 수 없다. 변경 의도는 대화가 아니라 커밋 이력과 diff에서 직접 파악한다. 인자(`$ARGUMENTS`)가 있으면 언어, 대상 브랜치, draft 여부 같은 사용자 지시로 취급한다.

## 절차

1. **상태 확인**
   - `git status --short`로 커밋되지 않은 변경이 있는지 확인한다. 있으면 PR을 만들지 말고 "커밋되지 않은 변경이 있다"고 보고한 뒤 종료한다. 사용자가 의도하지 않은 변경을 PR에 섞지 않기 위해서다.
   - `git branch --show-current`로 현재 브랜치를 확인한다. 기본 브랜치(`main`/`master`)이면 PR을 만들 수 없으므로 보고하고 종료한다.
   - `gh auth status`로 인증을 확인한다. 실패하면 `! gh auth login` 실행을 안내하고 종료한다.

2. **베이스 브랜치 결정**
   - 인자로 지정되면 그것을 사용한다. 아니면 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`로 얻는다.

3. **변경 분석**
   - `git log <base>..HEAD --format='%h %s%n%b'`와 `git diff <base>...HEAD --stat`, 필요한 파일만 `git diff <base>...HEAD -- <path>`로 확인한다.
   - 비교할 커밋이 없으면 보고하고 종료한다.
   - 커밋 메시지를 그대로 나열하지 말고 "무엇이 왜 바뀌었는지"를 리뷰어 관점에서 요약한다.

4. **템플릿 선택과 작성**
   - 언어 결정 순서: 인자의 명시 지시, 없으면 커밋 메시지 언어, 그래도 불명확하면 한국어.
   - 한국어: `references/template-ko.md`, 영어: `references/template-en.md`를 읽고 섹션 구조를 그대로 따른다. 섹션을 임의로 추가/삭제하지 않는다. 해당 없는 섹션은 "해당 없음"(N/A)으로 둔다.
   - 확인하지 않은 내용(테스트 통과 등)은 체크하지 않는다. 직접 실행해 확인한 항목만 체크한다.
   - 제목은 70자 이내, 커밋 컨벤션(`type: 설명`)을 따른다.

5. **푸시와 PR 생성**
   - 원격에 브랜치가 없거나 앞서 있으면 `git push -u origin HEAD`.
   - 본문은 임시 파일로 작성해 `gh pr create --base <base> --title "<제목>" --body-file <파일>`로 생성한다. 셸 이스케이프 문제를 피하기 위해서다. 인자에 draft 지시가 있으면 `--draft`를 추가한다.
   - 같은 브랜치의 PR이 이미 있으면(`gh pr view`) 새로 만들지 말고 기존 PR URL을 보고한다.
   - 본문 마지막에는 현재 세션의 attribution 규칙이 있으면 그 줄을 추가한다.

6. **결과 보고**
   - PR URL, 제목, 베이스 브랜치, 사용한 템플릿 언어를 간결하게 보고한다. 건너뛴 단계나 실패는 숨기지 않고 그대로 적는다.

## 금지

- 기본 브랜치로의 직접 푸시, force push, 기존 PR 본문 덮어쓰기.
- 사용자가 요청하지 않은 reviewer/label 지정.
- 비밀 값(`.env`, API 키)이 diff에 보이면 PR을 만들지 말고 보고한다.
