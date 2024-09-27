var existsSync = require("bun:fs").existsSync;
var fs = require("fs");
var colorize = require("colorize");
const { exec } = require("child_process");

export function setupGit() {
    console.log(
        colorize.ansify("#green[(FerrumC)] #grey[Initialising Git...]")
    );
    if (existsSync("./git_repo")) {
        console.log(
            colorize.ansify(
                "#green[(FerrumC)] #grey[Git repository already exists]"
            )
        );
    } else {
        console.log(
            colorize.ansify(
                "#green[(FerrumC)] #grey[Cloning git repository...]"
            )
        );
        exec(
            "git clone --bare https://github.com/ferrumc-rs/ferrumc ./git_repo",
            function (error: Error, stdout: string, stderr: string) {
                if (error) {
                    console.error(
                        colorize.ansify(
                            "#red[(FerrumC)] #red[Failed to clone git repository]"
                        )
                    );
                    console.error(stderr);
                } else {
                    console.log(
                        colorize.ansify(
                            "#green[(FerrumC)] #green[Git repository cloned]"
                        )
                    );
                }
            }
        );
    }
}

export function getMostRecentCommit() {
    var proc = Bun.spawnSync(["git", "-C", "./git_repo", "fetch", "--all"]);

    if (proc.exitCode !== 0) {
        console.log(
            colorize.ansify(
                "#red[(FerrumC)] #red[Failed to fetch git repository]"
            )
        );
        console.error(proc.stderr);
        return null;
    }

    var pretty_text =
        '--pretty=format:"[%s](https://github.com/ferrumc-rs/ferrumc/commit/%H) - %aN | <t:%at:R>"';
    var proc = Bun.spawnSync([
        "git",
        "-C",
        "./git_repo",
        "log",
        "--branches='*'",
        "-1",
        pretty_text,
    ]);
    if (proc.exitCode !== 0) {
        console.log(
            colorize.ansify(
                "#red[(FerrumC)] #red[Failed to get most recent commit]"
            )
        );
        console.error(proc.stderr);
        return null;
    } else {
        let commit_hash = Bun.spawnSync(
            ["git", "log", "--branches='*'", "-1", "--format=%H"],
            { cwd: "./git_repo" }
        )
            .stdout.toString()
            .trim();
        let branch_name = Bun.spawnSync(
            [
                "git",
                "branch",
                "--no-color",
                "--no-column",
                "--format",
                '"%(refname:lstrip=2)"',
                "--contains",
                commit_hash,
            ],
            {
                cwd: "./git_repo",
            }
        )
            .stdout.toString()
            .trim();
        console.log("Branch name: " + branch_name);
        console.log("Commit hash: " + commit_hash);
        console.log("Output: " + proc.stdout.toString());
        var output = proc.stdout.toString().trim();
        var final = `[${branch_name}] ${output}`;
        console.log("Final: " + final);
        return final;
    }
}
