const { Octokit } = require("octokit")
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

export async function getRepoInfo() {
    let res = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: "ferrumc-rs",
        repo: "ferrumc",
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    return res.data;
}

export async function getBranches() {
    let res = await octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner: "ferrumc-rs",
        repo: "ferrumc",
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    return res.data;
}

let latestCommit = {};

function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


export async function getLatestCommit() {
    let branches = await getBranches();
    let data = [];

    for (let i = 0; i < branches.length; i++) {
        try {
            const res = await octokit.request(branches[i].commit.url, {
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            data.push(res.data);
        } catch (error) {
            console.log(error)
        }
    }

    let commitData = [];

    for (let i = 0; i < data.length; i++) {
        await delay(1000);
        try {

            const res = await octokit.request(data[i], {
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            commitData.push(res.data);
        } catch (error) {
            console.log(error)
        }
    }

    latestCommit = commitData.sort((a, b) => {
        const dateA = new Date(a.commit.committer.date);
        const dateB = new Date(b.commit.committer.date);
        // Convert dates to milliseconds and compare
        return (dateB.getTime() - dateA.getTime());
    })[0];
}

export function getLatest() {
    return latestCommit;
}