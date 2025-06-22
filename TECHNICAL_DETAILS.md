# CloudForge - Technical Implementation Details

## No AI/LLM Calls - Pure Programming

This application uses **zero external AI APIs or LLM calls**. Everything is traditional programming:

### Template Generation Logic

1. **Static Templates**: Pre-written CloudFormation, GCP Deployment Manager, and Azure ARM templates
2. **String Interpolation**: Project name gets inserted into template descriptions
3. **Fixed Cost Estimates**: Hard-coded pricing (AWS: $247, GCP: $198, Azure: $289)
4. **Simulated Delay**: 2-second setTimeout to mimic "AI processing"

```javascript
// From server/routes.ts
const templates = {
  aws: {
    name: "AWS CloudFormation", 
    code: generateAWSTemplate(project), // Just string templates
    estimatedCost: 247, // Hard-coded
    provider: "aws"
  }
};
```

### How Each Feature Works

**Project Input**: Basic form validation and file uploads to local filesystem
**Configuration**: Form data stored in memory, no external processing
**Template Generation**: Static YAML/JSON templates with project name interpolation
**Deployment**: Mock progress with setInterval timers, no real cloud API calls

### File Structure
```
server/routes.ts         # API endpoints with static responses
server/storage.ts        # In-memory data storage
client/src/components/   # React forms and UI
shared/schema.ts         # TypeScript types
```

### External Dependencies
- Express.js for HTTP server
- React for frontend
- Multer for file uploads

This is a realistic demo that looks sophisticated but uses traditional programming techniques throughout.