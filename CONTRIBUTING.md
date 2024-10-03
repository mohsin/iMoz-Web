
# Contributing to iMoz-Web

First off, thank you for taking the time to contribute! This guide details how you can help the project by suggesting new features, fixing bugs, or submitting code changes. I appreciate all forms of help!

## Table of Contents
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Commit Messages](#commit-messages)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Style Guidelines](#style-guidelines)

## How Can I Contribute?

You can contribute in many ways:
- Reporting a bug
- Suggesting new features or improvements
- Writing or improving documentation
- Writing tests
- Submitting pull requests (PRs)

### Reporting a Bug
If you encounter a bug, please file an issue with the following details:
- Steps to reproduce the problem
- Expected behavior
- Actual behavior
- Environment (browser, OS, etc.)
- Screenshots (if applicable)

### Suggesting Features
Have an idea for an improvement? Feel free to open an issue or submit a feature request. When suggesting features:
- Describe the problem it solves.
- Provide context on how the feature benefits the project.

## Development Workflow

### Setting up the Project
1. Fork the repository and clone your fork:
   ```zsh
   git clone https://github.com/your-username/iMoz-Web.git
   cd iMoz-Web
   ```
2. Install the dependencies:
   ```zsh
   pnpm install
   ```

### Running the Project
To run the project locally:
```zsh
pnpm run dev
```

### Running the Build on Every Commit
I use [pnpm](https://pnpm.io) to build the project. Ensure that the build runs successfully before every commit using:
```zsh
pnpm run build
```

## Commit Messages
I use [Conventional Commits](https://www.conventionalcommits.org) for all my projects.

Follow this format for writing semantic commit messages:
```
<type>(<scope>): <subject>
```
Types include:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Changes to documentation
- **style**: Code style improvements (formatting, missing semi-colons, etc.)
- **refactor**: Refactoring code
- **test**: Adding or updating tests
- **chore**: Other changes (build scripts, package updates, etc.)

Examples:
```
chore(events): Android Development Workshop added
style(global): Improved nav link styles for readability
```

## Pull Request Guidelines

Before submitting a pull request:
1. Ensure your code builds without errors.
2. Follow the project's coding style.

When opening a pull request:
- Explain the purpose and changes made.
- Reference related issues or PRs, if applicable.

## Style Guidelines

I follow these guidelines for code formatting:
- **Vue**: Use functional components and Vue composables whenever possible.
- **CSS/Sass**: Avoid using CSS/Sass unless necessary. This project using tailwindCSS so it's preferred for styling consistency.

---

Thank you for contributing! 🙌
