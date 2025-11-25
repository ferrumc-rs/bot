import { Octokit } from "@octokit/core";

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getMostRecentCommit() {
  let commitRes = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "ferrumc-rs",
    repo: "ferrumc",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  let commit = commitRes.data[0];
  let time = Math.floor(new Date(commit.commit.author!.date!).getTime() / 1000);

  let statusRes = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs?head_sha={ref}",
    {
      owner: "ferrumc-rs",
      repo: "ferrumc",
      ref: commit.sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  let emoji = "❔";

  if (statusRes.data.workflow_runs[0].status == "completed") {
    switch (statusRes.data.workflow_runs[0].conclusion) {
      case "success":
        emoji = "✔️";
        break;

      case "failure":
        emoji = "❌";
        break;

      case "pending":
        emoji = "⏳";
        break;

      default:
        break;
    }
  } else {
    emoji = "⏳";
  }

  let message = `[${commit.author?.login}](${commit.author?.url}) : [${commit.commit.message}](${commit.html_url}) | <t:${time}:R> ${emoji}`;
  return message;
}

export async function getStars() {
  let res = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: "ferrumc-rs",
    repo: "ferrumc",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return res.data.stargazers_count;
}

export async function getForks() {
  let res = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: "ferrumc-rs",
    repo: "ferrumc",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return res.data.forks_count;
}

export async function getCommits() {
  let res = await octokit.request(
    "GET /repos/{owner}/{repo}/commits?sha={branch}&per_page=1&page=1",
    {
      owner: "ferrumc-rs",
      repo: "ferrumc",
      branch: "master",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  let headerText = res.headers.link!.split(",")[1];
  let commitCount = headerText.match(/&page=(\d+)/)![1];

  return commitCount;
}
