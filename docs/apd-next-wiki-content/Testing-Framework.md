# eAPD Testing Framework

## Unit Testing

Unit testing is important for testing out the functionality of individual components. Unit tests isolate a component and make sure the component is working individually before we implement it into eAPD. A good unit test has 100% code coverage, meaning that 100% of the code is touched during the tests. For our unit tests we use: TBD

## Integration Testing

Integration testing is an essential part of our CI/CD pipeline. It’s essentially a “happy pass” of the features within eAPD. These tests make sure the intended functionality of each and every component of the application hasn't changed. This gives our developers confidence that the work they are merging does not have any unintended consequences elsewhere. For end-to-end integration testing we use: TBD

## Visual Regression Testing

Visual regression testing is another form of automated testing. It covers aspects that cannot be checked during integration testing, the visuals. Every single change, no matter how small, is documented and easily reviewed by any team member. This is a powerful tool as it can catch any and all unintended visual changes as we continuously integrate to eAPD. The tool we use for this type of testing is: TBD

## Accessibility Testing

eAPD is [508 compliant](https://www.section508.gov/) which aligns with [WCAG AA requirements](https://www.w3.org/TR/WCAG21/). We incorporate accessibility in to all commits, testing all accessibility features such as tab navigation, intended screen reader functionality, UI adaptability to zoom/different screen sizes, and text scaling.

## CI/CD (continuous integration/continuous delivery)

All of the testing techniques listed above should be incorporated into our CI/CD pipeline. All these tests are run and must pass before any feature can be merged into eAPD.

## Manual Testing

Along with manual acceptability testing, we expect to manually test the intended functionality of each piece of work before it gets shipped. Once manual testing passes and all other automated tests pass, the final step in our QC process is the final sign off from our product/design team. This ensures that all eyes are on a piece of work before it fully gets merged in.

## Measuring Testing Metrics

For measuring testing metrics, we use code coverage to get an idea about how much of our code is covered in tests. We use [CodeCov](https://about.codecov.io/) for the feature and are striving for a 90% code coverage across the whole application.

## Security

We use a wide variety of software to help upkeep security within eAPD. The software we use is: TBD
