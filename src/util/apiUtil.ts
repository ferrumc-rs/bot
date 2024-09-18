export async function getRepoInfo() {
    const url = "https://api.github.com/repos/ferrumc-rs/ferrumc";

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`)
        }

        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}