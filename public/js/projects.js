async function fetchProjects() {
  let repos = [];
  let page = 1;
  let perPage = 100;

  try {
    // Fetch all repositories using pagination
    while (true) {
      const response = await fetch(`/projects/fetch?page=${page}&per_page=${perPage}`);
      const pageRepos = await response.json();

      if (pageRepos.length === 0) {
        break; // No more repos to fetch
      }

      repos = repos.concat(pageRepos);
      page++;
    }

    // Function to truncate text with "..." only if necessary
    function truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
    }

    // Function to pad text with spaces to ensure proper column alignment
    function padText(text, length) {
      return text.padEnd(length, ' ');
    }

    // Function to dynamically pad the repo_id (install command) for alignment
    function padRepoId(index) {
      const id = index + 1; // Repo index starts from 1
      return `/install.sh?repo_id=${id}`; // Removed the "example.com" part
    }

    // Column widths to match the HTML header size
    const maxNameLength = 24; // Adjusted to ensure proper width
    const maxDescriptionLength = 63; // Adjusted for consistency
    const maxInstallCommandLength = 30; // Adjusted for the install command path

    // Build table rows (without the header since it's in HTML)
    const tableContent = repos.map((repo, index) => {
      const name = padText(truncateText(repo.name || 'Unknown', maxNameLength), maxNameLength); // Pad and truncate name
      const description = padText(truncateText(repo.description || 'No description', maxDescriptionLength), maxDescriptionLength); // Pad and truncate description

      // Make the project name clickable, linking to the GitHub URL
      const clickableName = `<a href="${repo.html_url}" class="clickable-repo" target="_blank">${name}</a>`;

      // Curl install command dynamically generated based on the index with proper padding
      const curlInstall = padText(padRepoId(index), maxInstallCommandLength);

      // Return the formatted ASCII table row with the clickable project name
      return `| ${clickableName} | ${description} | ${curlInstall} |`;
    }).join('\n');

    // Add the table rows to the pre-existing header and footer in HTML
    document.getElementById('projects-table-content').innerHTML = tableContent; // Insert as HTML to preserve the clickable links
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

// Fetch projects when the page loads
fetchProjects();
