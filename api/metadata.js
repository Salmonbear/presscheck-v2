// Helper function to check if input is a URL
function isURL(str) {
    try {
        const url = new URL(str.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// Helper function to fetch article content from URL using Jina AI Reader
async function fetchArticleFromURL(url) {
    const jinaURL = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaURL, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch article from URL');
    }

    return await response.json();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { article } = req.body;

    if (!article) {
        return res.status(400).json({ error: 'Article URL is required' });
    }

    if (!isURL(article)) {
        return res.status(400).json({ error: 'Valid URL is required' });
    }

    try {
        const articleData = await fetchArticleFromURL(article.trim());

        // Extract title from Jina AI response
        const title = articleData.data?.title || articleData.title || 'Article';

        return res.status(200).json({
            title: title,
            url: article.trim()
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to fetch article metadata' });
    }
}
