# Kleinpanic website

**Kleinpanic** is my personal website and blog where I share tech-related insights, projects, and music. This repository contains the open-sourced portion of the website, excluding sensitive files like `.env`.

---

## Features

- **Blogging platform**: Built with Node.js and Express.
- **Project sharing**: Utilizes GitHub for audio file storage.
- **Custom routes**: Automatically serve different pages for requests from curl or a browser.
- **Responsive Design**: Optimized for both desktop and mobile users.
- **Email Sign-In**: Secure email-based login system.

---

## Getting Started

### Prerequisites

To run this project locally, you'll need:

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
    git clone https://github.com/kleinpanic/kleinpanicWeb.git 
    ```
2. **Navigate to the project dir**
    ```bash
    cd kleinpanicWeb
    ```
3. **Install Dependencies**
    ```bash
    npm install 
    ```
4. **create an .env file**
> this is for the contact section, and some email features. This should be your email as this is designed to inform yourself about contact attemps.
    ```
    EMAIL_ADDDRESS=
    EMAIL_PASSWORD=
    ```
6. Run the development server
    ```bash
    npm run start
    ```
7. Acces the Website
    ```bash
    http://localhost:port
    ```

---

## Folder Structure

```plaintext
kleinpanic-website/
│
├── public/           # Static files (CSS, images, etc.)
├── views/            # Frontend templates (ejs)
├── routes/           # JS
├── blog/             # Dir to contain blogs
├── package.json      # NPM installs.
├── server.js         # Entry point for the server
└── README.md         # Project documentation
```

---

## Contribution

This is my personal website, but if you want to view it, make your own with a similar view and functionality:
    1. clone this repository 
    2. View code
    3. Do whatever 


or If you'd like to contribute:

    1. Fork this repository.
    2. Create a new branch (git checkout -b feature/feature-name).
    3. Commit your changes (git commit -m 'Add some feature').
    4. Push to the branch (git push origin feature/feature-name).
    5. Open a Pull Request.

---

## License 

Read the LICENSE file. 

---
