import fetch from 'node-fetch'

export async function queryBackend(query, url, headers) {
    const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
            variables: {},
            query
        })
    });
    return result.json();
}
