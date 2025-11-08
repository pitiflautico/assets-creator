# Contributing to AI App Publisher System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

### Prerequisites
- Node.js 16+
- TypeScript knowledge
- Git

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your API keys (optional for development)
3. Run `npm run build` to compile
4. Run `npm run dev` to test

## Code Standards

### TypeScript
- Use strict typing
- Avoid `any` type when possible
- Document complex functions
- Use async/await over promises

### Formatting
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Keep lines under 100 characters

### File Organization
- One class per file
- Group related functions
- Export public APIs clearly
- Keep internal utilities private

## Making Changes

### 1. Module Development

Each module should:
- Have a clear, single responsibility
- Include error handling
- Provide helpful logging
- Handle edge cases

Example:
```typescript
export class MyModule {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async processData(input: string): Promise<Result> {
    try {
      Logger.step('Processing data...');
      // Implementation
      Logger.success('Data processed');
      return result;
    } catch (error) {
      Logger.error(`Failed to process: ${error}`);
      throw error;
    }
  }
}
```

### 2. Adding AI Features

When adding new AI integrations:

1. Add API client initialization in constructor
2. Implement fallback behavior
3. Handle API errors gracefully
4. Document API requirements

### 3. UI/CLI Changes

For CLI modifications:
- Use Inquirer for prompts
- Use Chalk for colored output
- Use Ora for spinners
- Provide clear error messages

### 4. Testing

While we don't have automated tests yet, please:
- Test all code paths manually
- Test error scenarios
- Test with different project types
- Document test steps in PR

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add support for custom color palettes
fix: Handle missing app.json gracefully
docs: Update API documentation
refactor: Simplify image optimization logic
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

## Pull Request Process

1. **Update documentation** if needed
2. **Add to CHANGELOG** (if exists)
3. **Test thoroughly**
4. **Write clear PR description**:
   - What does this change?
   - Why is it needed?
   - How was it tested?

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tested manually
- [ ] No breaking changes
```

## Areas for Contribution

### High Priority
- [ ] Add automated tests (Jest)
- [ ] Implement Fastlane integration
- [ ] Add App Store Connect API
- [ ] Add Google Play API
- [ ] Improve error handling

### Medium Priority
- [ ] Add more AI models support
- [ ] Implement A/B testing for metadata
- [ ] Add video generation
- [ ] Create Electron GUI
- [ ] Multi-language support

### Good First Issues
- [ ] Improve documentation
- [ ] Add more color palettes
- [ ] Better screenshot templates
- [ ] Additional icon sizes
- [ ] Code comments

## Code Review

All PRs require review. Reviews focus on:
- Code quality and style
- Functionality correctness
- Documentation completeness
- User experience
- Performance

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Ask in PR for code questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better for everyone!
