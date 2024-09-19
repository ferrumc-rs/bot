
var colorize = require('colorize');
const configParser = require("./configParser");
const { createWorker, createScheduler } = require("tesseract.js");

const { fetch } = globalThis;
const axios = require("axios");

export async function getImageAttachmentURLs(attachments: any) {
    const urls: String[] = [];

    if (attachments && attachments.size > 0) {
        await Promise.resolve(attachments.forEach(async (attachment: any) => {
            if (attachment.contentType.startsWith('image')) {
                urls.push(attachment.url)
            }
        }))
    }

    return urls;
}

export async function getTextAttachmentURLs(attachments: any) {
    const urls: String[] = [];

    if (attachments && attachments.size > 0) {
        await Promise.resolve(attachments.forEach(async (attachment: any) => {
            if (attachment.contentType.startsWith('text/plain')) {
                urls.push(attachment.url);
            }
        }))
    }

    return urls;
}

export async function handleDiscordReply(attachments: any) {
    const imageURLs = [
        ...await Promise.resolve(getImageAttachmentURLs(attachments))
    ]

    const parsedText = [
        ...await Promise.resolve(analyseImageURLs(imageURLs))
    ]

    const data = getSolutions(
        "",
        parsedText.join(' ')
    )

    return data;


}

export async function handleDiscord(message: any, attachments: any) {
    const imageURLs = [
        //...await Promise.resolve(getImageAttachmentURLs(attachments)),
        ...await Promise.resolve(getImagesURLsFromContent(message))
    ];

    const textURLs = [
        ...await Promise.resolve(getTextAttachmentURLs(attachments)),
        ...await Promise.resolve(getTextURLsFromContent(message)),
    ] // i could condense the image parsing and text parsing into a single array but it's just easier to manage for me imo

    const parsedText = [
        ...await Promise.resolve(parseTextFiles(textURLs)),
        ...await Promise.resolve(analyseImageURLs(imageURLs))
    ]

    const data = getSolutions(
        message,
        parsedText.join(' ')
    )

    return data;
}

async function getSolutions(message: any, parsedContent: any) {
    try {
        let responseArray = null; // Starts as null. This is handled further down.
        let reactionsArray = []; // array of reactions depending on the found solutions and its configured reactions if it has any.

        let foundSolutions = 0; // used to compare the amount of found solutions to the configured limit per message.
        const foundSolutionsLimit = configParser.getConfig().Settings.analysisLimit; // get the configured limit per message;

        const configuredKeywords = configParser.getConfig().keywords; // get all configured support keywords & their configurations
        const configuredPatterns = configParser.getConfig().regex; // get all configured support regex patterns & their configurations

        let lowerCaseMessage = message.toLowerCase(); // put them into lowercase.
        let lowerCaseContent = parsedContent.toLowerCase();

        // --- TEXT PARSING --- //

        if (configuredKeywords !== undefined && configuredKeywords !== null) { // just in case they didn't configure anything
            for (const keywordData of configuredKeywords) { // start looping through all configured keywords
                if (foundSolutions >= foundSolutionsLimit) break; // if amount of found solutions matches the limit then break. This will repeat for the regex loop too.
    
                let keyword = keywordData.keyword.toLowerCase(); // into lower case
                let reactions = keywordData.reactions; // get array of reactions if configured
                let responses = keywordData.response; // get solutions
    
                if (lowerCaseMessage.includes(keyword) || lowerCaseContent.includes(keyword)) {
                    console.log(colorize.ansify(`#green[(FerrumC)] #blue[Found keyword] #yellow[${keyword}] #blue[in message / attachments!]`))
    
                    reactionsArray = mergeReactions(reactionsArray, reactions);
                    if (foundSolutions === 0) { // if no solutions have been found before, just chuck the solutions into the array.
                        responseArray = responses.join('\n')
                        continue;
                    }
    
                    // if solutions have been found before, add it in, separating each solution with the configured splitter (default is \n\n\n)
                    responseArray = responseArray + configParser.getConfig().Settings.analysisSplit + responses.join(`\n`)
    
                    foundSolutions++; // bump up the found solutions
                    continue;
                }   
            }
        }

        // --- REGEX PARSING --- //
        if (configuredPatterns !== undefined && configuredPatterns !== null) {
            for (const regex of configuredPatterns) { // same as before but looping through the patterns
                if (foundSolutions >= foundSolutionsLimit) break;
    
                let pattern = regex.pattern;
                let reactions = regex.reactions;
                let responses = regex.response;
                
                const regexPattern = new RegExp(pattern); // in the support YAML config, the pattern is originally a string because yaml is a pain, so here we're converting it back into a regex expression.
    
                if (regexPattern.test(lowerCaseMessage) || regexPattern.test(lowerCaseContent)) {
                    console.log(colorize.ansify(`#green[(FerruMC)] #blue[Found pattern] #yellow[${pattern}] #blue[in message / attachments!]`))
    
                    reactionsArray = mergeReactions(reactionsArray, reactions);
                    if (foundSolutions === 0) {
                        responseArray = responses.join('\n')
                        continue;
                    }
    
                    responseArray = responseArray + configParser.getConfig().Settings.analysisSplit + responses.join(`\n`)
    
                    foundSolutions++; // bump up the found solutions
                    continue;
                }
            }
        }

        console.log(colorize.ansify(`#green[(FerrumC)] #grey[Finished parsing all text and attachments. Returning data.]`))

        if (responseArray === null || responseArray === undefined) return null;
        return formJSONData(responseArray, reactionsArray)

    } catch (error) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when parsing a message: \n${error}]`));

        return null;
    }
}

function formJSONData(responses: any, reactions: any) { // forms the data for the parser to then respond to.
    const data = { // iirc IRC (and possibly Slack) don't have reaction support so in that case i'll just make it ignore the reactions value
        message: responses,
        reactions: reactions
    }

    return data;
}

function mergeReactions(oldArray: any, reactions: any) {
    const newArray = oldArray;
    for (const reaction of reactions) {
        newArray.push(reaction) // basically just combines the old array with the new reactions
    }

    return newArray;
}

async function parseTextFiles(urls: any) {
    const data: any = [];

    const textPromises = urls.map(async (url: any) => {
        const fileContent = await fetch(url);
        if (fileContent.ok) {
            const text = await fileContent.text();
            if (text) {
                data.push(text);
            }
        }
    })
    await Promise.all(textPromises);
    return data;
}

async function getImagesURLsFromContent(message: any) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchedURLs = message.match(urlRegex);
    
    if (matchedURLs === null || matchedURLs === undefined || matchedURLs.length <= 0) return [];
    const urls: any = [];

    await Promise.all(matchedURLs.map(async (url: any) => {
        try {
            const response = await axios.head(url);
            const contentType = response.headers['content-type'];
            if (contentType && contentType.startsWith('image')) urls.push(url);
        } catch (error) {
            console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when fetching URLs from messages: \n${error}]`))

            return [];
        }
    }));

    return urls;
}

async function getTextURLsFromContent(message: any) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchedURLs = message.match(urlRegex);
    
    if (matchedURLs === null || matchedURLs === undefined || matchedURLs.length <= 0) return [];
    const urls: any = [];

    await Promise.all(matchedURLs.map(async (url: any) => {
        try {
            const response = await axios.head(url);
            const contentType = response.headers['content-type'];
            if (contentType && contentType.startsWith('text/plain')) urls.push(url);
        } catch (error) {
            console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when fetching URLs from messages: \n${error}]`))

            return [];
        }
    }));

    return urls;
}

async function connectArrays(string: any, array: any) {
    const joinedArray = array.join(` `)
    string = `${string} ${joinedArray}`
}

async function analyseImageURLs(urls: any) { // array of URLs. Will occur after direct attachment URLs / message embedded URLs are retrieved and condensed.
    const text: any = []; // empty array to start with

    if (urls && urls.length > 0 ) { // sanity checks. probably not needed.
        const jobs: any = []; // array of all pending image parsing jobs for tesseract.

        const scheduler = await createScheduler(); // create scheduler for tesseract parsing

        const workerGen = async () => {
            const worker = await createWorker(
                'eng', // english lang
                1,
                {
                    cachePath: "." // path for caching
                }
            )
            scheduler.addWorker(worker); // add to scheduler
        }

        const workerCount = configParser.getConfig().parsing.worker_count; // Get configured amount of workers.
        const resArr = Array(workerCount);
        for (let i = 0; i < workerCount; i++) {
            resArr[i] = workerGen()
        }
        await Promise.all(resArr);

        const resArr2 = Array(urls.length);
        await Promise.all(urls.map(async (url: any) => {
            jobs.push(scheduler.addJob('recognize', url).then((x: any) => { // schedule a text parsing ('recognize') job.
                text.push(x.data.text)
            }))
        }))
        await Promise.all(jobs); // wait for all jobs to finish
        await scheduler.terminate(); // terminate the scheduler and its workers

        console.log(colorize.ansify(`#green[(FerrumC)] #grey[Finished parsing] #yellow[${urls.length}] #grey[attachment(s). Continuing.]`))
    } else return [];

    return text;
}