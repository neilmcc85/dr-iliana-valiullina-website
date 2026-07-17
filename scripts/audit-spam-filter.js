const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('worker.js', 'utf8').replace('export default', 'const workerDefault =');
const context = { console, Response, fetch };
vm.createContext(context);
vm.runInContext(source, context);

const cases = [
  {
    name: 'SEO cold pitch',
    expected: true,
    payload: {
      fullName: 'devansh kumar',
      email: 'devansh@designapp.in',
      inquiryType: 'General Inquiry',
      message:
        'S-E-O Offers. Your website is not ranking on Google. We can place your website on Google 1st page. May I send you a Price, SEO Packages?'
    }
  },
  {
    name: 'mobile app cold pitch',
    expected: true,
    payload: {
      fullName: 'Rober thenry',
      email: 'rober@example.com',
      inquiryType: 'General Inquiry',
      message:
        'I build custom mobile apps to help businesses connect better with their customers. Reply and I will share examples and cost details.'
    }
  },
  {
    name: 'legitimate language inquiry',
    expected: false,
    payload: {
      fullName: 'Maria Ivanova',
      email: 'maria@example.com',
      inquiryType: 'Language Lessons Inquiry',
      message:
        'Hello, I would like to book Russian for Lawyers lessons. I am interested in legal terminology and contract language.'
    }
  }
];

for (const testCase of cases) {
  const actual = context.isLikelySpam(testCase.payload);
  if (actual !== testCase.expected) {
    throw new Error(`${testCase.name}: expected ${testCase.expected}, received ${actual}`);
  }
  console.log(`${testCase.name}: ${actual ? 'blocked' : 'allowed'}`);
}
