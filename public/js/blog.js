fetch('/blog/blog-posts')
  .then(response => response.json())
  .then(posts => {
    const blogContainer = document.getElementById('blog-container');
    posts.forEach(post => {
      // Create a clickable link wrapping the entire blog preview
      const blogLink = document.createElement('a');
      blogLink.href = `/blog/${post.slug}`;
      blogLink.className = 'blog-link'; // Optional class for styling
      blogLink.style.textDecoration = 'none'; // Remove the underline from the link

      const blogPreview = document.createElement('div');
      blogPreview.className = 'blog-preview';

      // Create the blog preview with the title, date, and preview
      blogPreview.innerHTML = `
        <h3 class="post-title">${post.title}</h3> <!-- Apply the pink color to the title -->
        <p class="post-date">Published on ${post.date}</p> <!-- Apply the amber color to the date -->
        <p class="post-preview">${post.preview}...</p> <!-- Apply the amber color to the preview -->
      `;

      // Append the preview div inside the link, then add the link to the container
      blogLink.appendChild(blogPreview);
      blogContainer.appendChild(blogLink);
    });
  })
  .catch(error => console.error('Error fetching blog posts:', error));