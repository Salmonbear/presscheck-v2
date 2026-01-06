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
            'Accept': 'text/plain'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch article from URL');
    }

    return await response.text();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { article } = req.body;

    if (!article) {
        return res.status(400).json({ error: 'Article text or URL is required' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    try {
        // Check if input is a URL and fetch content if it is
        let articleText = article;
        if (isURL(article)) {
            articleText = await fetchArticleFromURL(article.trim());
        }
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an assistant that evaluates the credibility of articles. Assess the article based on the following criteria and provide the results strictly in JSON format:

1. **Ratio of Claims to Facts and Evidence**: Assess if the article is based on solid facts and evidence or on unproven claims.
2. **Direct vs. Indirect Evidence**: Determine whether the article uses direct evidence (quotes, data) or indirect sources.
3. **Independent Analysis**: Check if the article is based on independent analysis or relies on second-hand information.
4. **Headline and Purpose**: Evaluate if the headline and main content reflect verified facts.
5. **Incendiary Nature**: Consider the sensitivity and impact of the article, especially if based on unproven claims.

Provide the following output strictly in JSON format:

{
  "score": <number>,
  "rating": "<string>",
  "summary": "<string>",
  "details": {
    "claimsToEvidence": "<html>",
    "evidenceType": "<html>",
    "independentAnalysis": "<html>",
    "headlineConsistency": "<html>",
    "incendiaryNature": "<html>"
  }
}

Ensure each 'details' field starts with the section's title followed by a description, and strings are formatted for HTML interpretation.`
                    },
                    {
                        role: 'user',
                        content: `Here is the article to assess: ${articleText}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        let result;
        try {
            result = JSON.parse(content);
        } catch (e) {
            result = {
                score: 50,
                rating: 'Unable to parse',
                summary: content,
                details: {
                    claimsToEvidence: '',
                    evidenceType: '',
                    independentAnalysis: '',
                    headlineConsistency: '',
                    incendiaryNature: ''
                }
            };
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to analyze article' });
    }
}
