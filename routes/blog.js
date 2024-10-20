const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const fm = require('front-matter'); // For parsing front matter
const RSS = require('rss'); // Import RSS package

// Directory containing Markdown blog posts
const blogDirectory = path.join(__dirname, '../blog');

// Function to get all Markdown files in the blog directory
function getBlogPosts() {
  const files = fs.readdirSync(blogDirectory);
  return files.filter(file => file.endsWith('.md')).map(file => {
    const content = fs.readFileSync(path.join(blogDirectory, file), 'utf-8');
    
    // Parse front matter
    const parsed = fm(content);
    const { title, date, preview } = parsed.attributes; // Get title, date, and preview from front matter

    // Remove Markdown formatting by converting to HTML and stripping the tags
    const htmlContent = marked(parsed.body);
    const plainText = htmlContent.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags from Markdown-converted content

    // Truncate the plain text to create the preview
    const generatedPreview = plainText.split(' ').slice(0, 30).join(' ').substring(0, 150); // First 150 characters

    // Use the preview from front matter if available, otherwise use the generated plain-text preview
    const finalPreview = preview || generatedPreview;

    const slug = file.replace('.md', ''); // Remove file extension for slug

    console.log(`Preview for ${title}: ${finalPreview}`); // Log the preview to verify

    return { 
      title, 
      date, 
      preview: finalPreview, // Ensure the correct preview is sent
      slug 
    };
  });
}


// New Route to generate RSS feed - put this before the dynamic slug route
router.get('/rss.xml', (req, res) => {
  const feed = new RSS({
    title: 'The Klein Blog',
    description: 'Latest updates from The Klein Blog',
    feed_url: `${req.protocol}://${req.get('host')}/rss.xml`,
    site_url: `${req.protocol}://${req.get('host')}`,
    language: 'en',
    pubDate: new Date().toUTCString(),
  });

  // Add each blog post to the RSS feed
  const posts = getBlogPosts();
  posts.forEach(post => {
    feed.item({
      title: post.title,
      description: post.preview, // Short preview for the RSS feed
      url: `${req.protocol}://${req.get('host')}/blog/${post.slug}`, // Link to the blog post
      date: post.date, // Published date
    });
  });

  // Set the content type to XML and send the RSS feed
  res.set('Content-Type', 'application/rss+xml');
  res.send(feed.xml());
});

// Route to serve the blog posts as JSON
router.get('/blog-posts', (req, res) => {
  const posts = getBlogPosts(); // Get all blog posts
  res.json(posts); // Return posts as JSON to be fetched by the client-side JS
});

// Route to serve the main blog page (serve blog.html)
router.get('/', (req, res) => {
  // Render the blog.html file from the views directory
  res.sendFile(path.join(__dirname, '../views/blog.html'));
});

marked.setOptions({
  gfm: true, // GitHub-flavored Markdown
  breaks: true, // Enable line breaks
  smartypants: true, // Use smart quotes, dashes, etc.
  sanitize: false, // This is the important option to allow HTML tags
});

// Route to serve individual blog posts dynamically
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(blogDirectory, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = fm(content); // Parse front matter
    const htmlContent = marked(parsed.body); // Convert markdown body to HTML
    res.render('post', { content: htmlContent, title: parsed.attributes.title, date: parsed.attributes.date }); // Render post view
  } else {
    res.status(404).send('Blog post not found');
  }
});

module.exports = router;