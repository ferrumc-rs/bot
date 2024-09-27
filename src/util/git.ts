var existsSync = require("bun:fs").existsSync;
var fs = require("fs");
var colorize = require("colorize");
const util = require("node:util");
const exec = util.promisify(require("child_process").exec);

export async function setupGit() {
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
        await exec(
            "git clone https://github.com/ferrumc-rs/ferrumc ./git_repo"
        ).catch((err: Error) => {
            console.error(
                colorize.ansify(
                    "#red[(FerrumC)] #red[Failed to clone git repository]"
                )
            );
            console.error(err);
        });
    }
}

export async function getMostRecentCommit() {
    var { stdout, stderr } = await exec("git -C ./git_repo pull --all").catch(
        (err: Error) => {
            console.error(
                colorize.ansify(
                    "#red[(FerrumC)] #red[Failed to fetch git repository]"
                )
            );
            console.error(stderr);
        }
    );

    var pretty_text =
        '--pretty=format:"[%S]: [%s](https://github.com/ferrumc-rs/ferrumc/commit/%H) - %aN | <t:%at:R>"';
    var replace_regex = /\[ \((.*)\)\]/g;
    var { stdout, stderr } = await exec(
        'git -C ./git_repo log --branches="*" -1 ' + pretty_text
    ).catch((err: Error) => {
        console.error(
            colorize.ansify(
                "#red[(FerrumC)] #red[Failed to fetch git repository]"
            )
        );
        console.error(stderr);
    });
    var output = stdout.replace(replace_regex, "$1");
    return output;
}
