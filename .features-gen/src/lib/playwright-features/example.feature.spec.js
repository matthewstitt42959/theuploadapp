// Generated from: src\lib\playwright-features\example.feature
import { test } from "playwright-bdd";

test.describe('Example health check', () => {

  test('Google loads successfully', async ({ Given, Then, page }) => { 
    await Given('I navigate to "https://www.google.com"', null, { page }); 
    await Then('the page title should be "Google"', null, { page }); 
  });

  test('API endpoint is reachable', async ({ Then, request }) => { 
    await Then('a GET to "https://httpbin.org/status/200" returns status 200', null, { request }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src\\lib\\playwright-features\\example.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I navigate to \"https://www.google.com\"","stepMatchArguments":[{"group":{"start":14,"value":"\"https://www.google.com\"","children":[{"start":15,"value":"https://www.google.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Outcome","textWithKeyword":"Then the page title should be \"Google\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Google\"","children":[{"start":26,"value":"Google","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":11,"pickleLine":7,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then a GET to \"https://httpbin.org/status/200\" returns status 200","stepMatchArguments":[{"group":{"start":9,"value":"\"https://httpbin.org/status/200\"","children":[{"start":10,"value":"https://httpbin.org/status/200","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":57,"value":"200","children":[]},"parameterTypeName":"int"}]}]},
]; // bdd-data-end