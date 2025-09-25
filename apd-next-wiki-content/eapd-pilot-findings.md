# Findings from the eAPD pilot research

## Executive Summary
The eAPD pilot started in July 2019 to test if the APD builder portion of the eAPD application is an improvement to the existing process for the creation and review of APDs. Four states were selected to participate, though only three completed and submitted an eAPD. Of the three states that completed the pilot, all received an approval of their APD built within the application.
 
Research conducted during the pilot showed that states and federal reviewers felt APDs were more organized, though it did require a mindset shift about how to think about how to create and review APDs. Consistently, the automation of math calculation was called out as a favorite capability of the application. While the eAPD has demonstrated an improvement to the way work is organized and presented, the application will still require some refinement before adding the next major piece of functionality and being deployed for more widespread use.

## Introduction

### Goal

The purpose of the pilot was to test if the eAPD application could improve compliance, accuracy, and completeness of APD submissions for state users while streamlining and improving the review process for federal users.

The main goal of our research was to understand what’s working well and what’s not working for users who are creating APDs through the eAPD app. We wanted to know how this compares to the current way of submitting APDs and see if it’s improving the process or making any aspect of it more difficult. 

### Hypotheses

1. State users can create, export, and submit an administratively complete APD for submission and review
2. The APD is structured and is not missing key fields necessary for completing a review of the document
3. Federal reviewers will be able to focus on the content of the activities contained within the APD, and there are no math or other administrative errors (not applicable sections excepted)
4. Layer 1 of the eAPD builder is functionally complete for release to a larger audience of state and federal users

Completion of the pilot will inform which major functionalities and bugs need to be resolved before we allow further users to access the application. Additionally, user feedback will inform the next stages of development by identifying the features that will deliver the most value for both state and federal users.

### Scope 

The pilot consisted of the “APD builder” where states used the eAPD application to create their APD. Once it was complete and ready to submit to CMS, the state users exported a PDF copy of their APD and submitted to their reviewer via email. 

CMS Medicaid Enterprise Systems (MES) state officers reviewed the PDF version of their state’s APD. Questions and/or comments to the APD were sent via email and any revisions to the APD were to be done within the application. This question-response cycle was repeated until a final decision could be made on the APD. 
Feedback from states and federal users were collected during multiple points of the creation, review, and response portion of the eAPD experience. A final interview was performed after the reviews were completed and a decision had been made.

## Pilot Methodology

### Recruiting

We put out an open call for states to volunteer for the pilot. We received 22 responses and selected states based on their APD complexity, APD structure, and previous research participation. Volunteers were informed that they should create their APDs exclusively using the application and to submit their APDs at least 60 days before October 1, 2019. Four states were selected: Alaska, Delaware, Idaho, and Florida. 
Research

We conducted our research in multiple phases due to the variable nature of the APD submission and review cycle. The primary research methods we used for the pilot were contextual inquiry (shadowing) and user interviews. 

### Shadowing states

Our first phase of the research consisted of shadowing states as they interacted with the eAPD app to author their APDs. The purpose of shadowing was to gain a rich understanding of how state users are using the app in a contextual, real-world situation. We wanted to find out what they actually do, not just what they say they will do. 

### State user interviews

The second phase of research consisted of user interviews where we did a deeper dive with the states about their eAPD experience after they submitted it to CMS. The main research questions we aimed to answer were:
* What were the high and low points about the eAPD experience?
* What was unclear or confusing? What’s still missing?
* What would they want to change about this experience? What else do they wish was possible or included?
* How did they work through inputting the information (e.g. all at once, with multiple people, etc)? How would they prefer to do this next time?
* How did the internal approval process work with the app? How well/not well did exporting work?
* How does the eAPD experience compare to the existing (previous) APD submission process?

### Shadowing reviewers

After CMS received the eAPD-generated PDFs and began reviewing, we conducted another round of shadowing sessions, this time with the state officers. During these sessions, we let the reviewers work through their review as they normally would and took notes as we observed. We asked a few follow-up questions about their experience but mainly remained in the background so that we could let them work while trying to understand their process and workflow.

### Final user interviews with states and reviewers

Once the APDs were approved, we conducted final user interviews with the states and federal participants where we wanted to find out:
* How did the review process go? What did the back and forth between states and state officers look like?
* How did this new structure of the APD facilitate/slow down state’s ability to author an APD and CMS’s review of submissions?
* How did filling out the APD with the app make states think differently about their goals and plans? Did CMS have what they needed in order to make an informed review?

### Synthesis

The synthesis was ongoing throughout the pilot so that we could keep an eye on the emerging trends. We combined all of the feedback into a single place where we were able to identify the themes across all of the research sessions. Once we wrapped up the final post-pilot interviews, we synthesized everything together and were able to determine the overall findings for the pilot.

## Findings and Discussion

**1. The eAPD format feels more coherent to state users than the template, but it will take some getting used to.** 

States are deeply familiar with the old APD template because it’s what they’ve always used, and they’ve been creating all of their HITECH APDs from it. When states were using the eAPD, they tried to map the sections of the app to the ones in the template but quickly found it wasn’t a direct one-to-one mapping. Instead, they ended up translating what’s in the app to the mental models they had from using the template.

One of the most notable changes to the organization of the APD is the general introduction of an activity-centric model where states separate out each activity/project and provides details about its scope, duration, and cost before moving to the next activity/project. Some states were already using this model, but for most states, this required a shift in mindset. 

Once state users had the chance to take in the new way the sections are structured, they came around to it and felt like it made them think critically about what they are writing in their APDs. Similarly, this format was also new to CMS reviewers. They noted it was more logical in how things were organized which makes the review process much easier since the app only asks for the information needed to complete a review and removes the “fluff.”

Here are some quotes from the pilot participants:
> “The eAPD helped me think differently about the APD and it was nice how it was broken down.”

> “It made you think about your program and the budget you were asking for, it put it in the context of funding activities instead of blathering on in a narrative.”

> “Organized by activity is very convenient. I look for the activities or main deliverables, and they’re just not usually organized like this.”

> “This new format helps with the consistency of responses and format. Sometimes you can see where there have been multiple writers and there are redundancies. This format forces consistency. It seems like eAPDs are more of a book with an editor, rather than a journal.”

**2. It’s useful to have a printed copy of the APD, but the exported PDF version from the eAPD lacks formatting which makes it less useful for states and is difficult to read.**

For the MVP version of the eAPD, we implemented an ‘export as PDF’ option for states to download their APD and submit to CMS. The PDF is a cleaned-up version of the APD as seen within the ‘APD builder’ portion of the application. Help text was removed and tables were cleaned up for printing; however, form fields remained visible within the exported document.  

Users found that some sections of the PDF appeared redundant (such as the Standards and Conditions content). On top of that, it was hard for them to keep track of which section they were reading because the headers are only at the beginning of the section. They also commented on how the PDF did not appear to be professional-looking because of the plain format, font sizing, and text appearing close to the edge of the document.

We also learned that some state users pass around a physical copy of the APD for internal reviews before submitting to CMS. Similarly, some CMS reviewers prefer to print out the APD they are reviewing and take a look through it on paper rather than on the screen. The takeaway from this finding is that even though the review process will ultimately take place in the eAPD app in the future, the print-to-PDF experience should still be usable and there are some low hanging fruit opportunities that we’re fixing to improve the PDF formatting. 

Here are some quotes from the pilot participants:
> “The print pdf version doesn’t look like a formal document, but it probably is much easier to read. It looks like bulleted notes.”

> “It ends up looking very vertical. This is a lot of space for very little information. A lot of this is the information I don’t need in the middle, and I don’t need it broken up into the input fields.”

> “I always print my APDs, and I find that I can find things quicker if I have a hard copy.”

**3. States and CMS love that the eAPD automatically calculates the math.**

Having the math auto-calculate was a favorite feature for states and CMS alike and was mentioned in, if not all, almost every interview. States felt like they were able to plug in the numbers without manually calculating and updating related tables. This saved time and allowed them to focus on their content. CMS reviewers felt like they could trust the numbers they were seeing because the computer did the math for them, and they didn’t need to waste any time double-checking it.

Here are some quotes from the pilot participants: 
> “In previous years, I had problems with the math. I like that it does the math for you.” 

> “It was a lot easier and a lot quicker than having to build your own template, where there are math errors.”

> “I didn’t check the math. I trusted it because computers are good at math.”

**4. The layout of the activities section requires lots of vertical scrolling which can be tricky to navigate and people feel like they can get “lost in the scroll.”** 

In an early iteration of the eAPD app, we tested a different version of the layout where it took users through the sections step-by-step rather than having everything visible at once. However, we found that users much preferred the version where they could scroll through everything instead of going through section by section; they wanted something that was familiar to what they were used to with the current way they are authoring APDs in Microsoft Word. 

In the pilot, users had difficulties keeping track of where they were in the app even with the side navigation sticking to the page and highlighting where they were. Especially in the Program Activities section, states were confused about which activity they were currently editing and had to scroll back up to the top to refresh their memory then scroll back down to where they were working. 

Here are some quotes from the pilot participants: 
> “Scrolling and scrolling, depending on how many activities, how many contracts you’ve put into you get kind of lost, at least I did anyway.”

> “For us, we ran into a burden because it was hard keeping track of where you are in the application.”

**5. The Standards and Conditions sections take up a significant amount of space within the eAPD but states often leave it blank or incomplete and which is not useful for CMS reviewers.**

One of the changes that state users perceived about the Standards and Conditions section is that now they are being asked about how each activity supports the Medicaid Standards and Conditions rather than summarizing it for the APD as a whole. While this is a regulatory requirement, it was surprising to states, and they felt that it was repetitive. The Standards and Conditions consisted of 11 individual questions and if there were, for example, 5 activities in an APD, that means they will be responding to 55 questions for Standards and Conditions which users pointed out feels excessive.

CMS reviewers found that the new Standards and Conditions format has the potential to be useful for their review if states fill it out thoughtfully instead of providing boilerplate responses. In the pilot, states were either leaving much of it blank or didn’t fill it out completely which was unhelpful for reviewers. Reviewers didn’t want to put a lot of effort into reviewing this content if states didn’t put much effort into writing it. How states are meeting the Standards and Conditions is important and relevant for CMS to consider when they are reviewing so making this section easier for states to respond to should be a priority.

Here are some quotes from the pilot participants:
> “I’m not sure if you expect a detailed sentence for every activity for standards and conditions, that seemed excessive to me so I didn’t do it.”

> “Standards and conditions was very repetitive, so I had to redo all the standards and conditions even though it was all HIE information.”

> “States fill standards and conditions out with boilerplate. Their response doesn’t tell me anything, it’s not the most helpful thing for me to review.”

**6. There are some small improvements that would have a big impact on the state user experience such as adding spellcheck, updating the rich text editor, and refining the help text.**

According to our pilot participants, the eAPD app is an improvement from the manual paper process, but there are some minor annoyances that impacted their user experience. For example, the app didn’t have spellcheck enabled in the text areas so users had to rely on pasting in text that had gone through spellcheck in another app or would do their best to avoid spelling errors. Along similar lines, the rich text editor caused some issues for states who were copying and pasting in large blocks of text because it kept in line breaks which required states to manually format.

Here are some quotes from the pilot participants:
> “When we had a list, it was difficult to copy and paste text, I put in the effort to fix the formatting and for the sake of finishing I didn’t do it all the way through.”

> “I resorted to putting my APD into Word and spell-checking it.”

> “The instructions are too high-level policy description; it’s too vague.”

**7. Behavioral takeaways**

In addition to the specific findings for certain sections of the app, we learned a lot about how state and CMS users behave with regards to interacting with the eAPD app. These behavioral takeaways are not necessarily something that we need to address, but they are important to keep in mind when designing new features and adding functionality.

Federal Reviewers

Each reviewer has their own way of reviewing an APD. Some reviewers jump to the money and financial pieces of the document, some prefer to print it out and review a paper format of the APD, and other reviewers probably have other preferences. The importance of this finding is that it means the tool needs to be flexible enough to account for different working styles and allow people to work the way that is best for them without being overly prescriptive.

State Users

For authoring APDs, everything is in the context of updating. It’s rare that an APD will be created brand new (with the exception of the first time users will have to enter it into the eADP), since most of the APD requests that CMS receives are updates to an already-approved APD. What this means for the app is that the update experience is not necessarily a separate experience, it should be ingrained in the app.
States are keeping track of more details than what is being asked of them in the eAPD. CMS only needs to know the information that helps them make a determination in their review of the APD, so if states were previously including this unnecessary information in their APDs before, they aren’t anymore. This means that states are tracking more than they share with CMS such as details for the milestones, meticulous financial records, spreadsheets, and tables. Because states have their own source of truth for this information, they will likely be doing a lot of copying and pasting into the app.

The authoring process of an APD is a team effort and there are often multiple state users involved in this process. Many times, the bulk of the APD content is written by a contractor. This means that eventually, multi-user support is going to be a critical feature and there is an element of permission-setting that has already been requested by states.   

Even though the help text and instructions appear to be prominent and visible to users, we found in usability testing that state users don’t typically read it. Many times they would ask a question to the moderator that is already answered in the help text. When we asked them if they would look anywhere on the site for an answer to their question, they might say they’d check the help text, but it wasn’t usually their first instinct. The takeaway for this is that the field labels are especially important because that’s what users are reading, the help should be considered supplemental.

### Discussion

Because of time constraints and deadlines, Alaska ended up submitting a traditional APD with the intention to complete another APD built within the eAPD app at a later time. Since we had to maintain our own timelines with the pilot, we decided that Alaska didn’t need to re-do their APD in the eAPD builder because it would introduce potential bias and would be additional work for them and their reviewer. Alaska provided feedback in the earlier research sessions, however, they did not participate in the post-pilot interviews.

Through the eAPD application, Delaware, Idaho, and Florida completed the end-to-end APD submission process and their reviewers fully approved their APDs in timeframes ranging from 31-46 days.

## Revisiting the hypotheses: hypotheses conclusions

**1. ✔️ State users can create, export, and submit an administratively complete APD for submission and review.**

Three out of the four pilot states submitted a complete APD for review that was reviewed and approved by CMS. Notably, states struggled with understanding why the standards and conditions section was repeated in each activity and did not complete all portions of the APD for each activity. The fourth state encountered unrelated time constraints that caused them to submit in the paper version; otherwise, they would have also submitted via the eAPD app.

**2. ✔️ The APD is structured and is not missing key fields necessary for completing a review of the document.**

The eAPD includes all of the fields necessary for CMS to review the document and make a decision on the request. Overall, MES state officers were pleased with the new structure and the breakout of the content by activities.

**3. ✔️ Federal reviewers will be able to focus on the content of the activities contained within the APD, and there are no math or other administrative errors (not applicable sections excepted).**

In the revised activity-based structure of the APD, reviewers were able to parse and focus on the scope, term, and cost of each proposal within the submission one item at a time. Compared to the existing APD structure which lumps content by topic instead of by activity, reviewers were not required to spend as much time trying to tie the scope, term, and cost of each proposed activity manually.

The application accurately performed math calculations across the APD. During the state interviews, at least one user reported that they had manually verified the math using an Excel spreadsheet and found no errors. 

**4. 🔜 Layer 1 of the eAPD builder is functionally complete for release to a larger audience of state and federal users.**

The application is functional and met the expectations for the scope and intent of the APD builder.  While we did release several bug fixes to the application, in its current form application can be scaled to other users only in the narrow scope for initial construction of their APD. The application does not have the ability to support APD updates, which limits its usefulness to sustain the use of the application through a project’s life cycle.

## Conclusions and Next Steps

Our emphasis on human-centered design has enabled us to build working software in a relatively short period of time that reflects the needs of the users. The pilot helped us test and confirm/refute our four hypotheses and have shown that the eAPD already is an improvement to the old way of authoring, submitting, and reviewing APDs. 
We are in a good place to build off of the research we have by continuing to learn about user needs while designing and testing more features. There is still some refinement and additional work to be done before we can scale the product to a broader audience, but we have some clear next steps ahead of us, and we know we are heading in the right direction.

**Addressing the highest priority pilot issues**

Throughout the pilot, we worked agilely by synthesizing the research as we went along and creating GitHub issues to address bugs and simple UI fixes. We didn’t want to release anything major while the pilot was underway to prevent research results from being affected, so we are beginning to address them now. 

**Improved help text**

From the state comments, we are exploring how to improve the help text across the app so that it’s more specific and provides additional guidance to staff completing the APD.

**Improved rich text editor and spell check**

We’ve enabled spellcheck and are working on implementing a new rich text editor that allows easier copying and pasting from other source documents, does not affect the user experience, and has a stronger community of support.

**Improved print preview and export**

We have implemented a revised version of the print preview, addressing some of the findings from the pilot. This includes the removal of the HTML form fields and improves the formatting and printing of the final PDF.

**Redesigned activity section**

After the pilot ended, we prototyped and tested a new version of the activities section that leverages a modal to organize the activity content with top-level navigation and it has been received well.
As part of this revision, we prototyped a new version of the Standards and Conditions questions to consolidate the 11 questions into a single one where states would fill it out one time per activity and, so far, it’s been preferred to the pilot version in usability testing.

**Client-side validation**

There is an opportunity on the state side to ensure they are completing all required sections and not leaving anything blank. Client-side validation has come up in earlier rounds of user research as well but will require more exploration for development.

**Training materials**

To mitigate some of the growing pains that states are experiencing with the new eAPD format and “translation” of the template, our team is in the process of creating training materials that will be used for introducing state users to the new app.

**Procuring and onboarding a new vendor**

We’re in the process of procuring a vendor to transition the eAPD project support from 18F to a new vendor who would be picking up where we left off and continuing the project with CMS. The rough timeline for this to happen is in mid-January when the vendor would be onboarding and 18F would overlap for a short period of time to assist with learning the systems and understanding the problem space.

**The next big thing**

The next major piece of functionality on the roadmap is to add the ability for users to complete an APD update within the application. Once the functionality is implemented, the eAPD will be able to track the entire lifecycle of any project. Based on our existing timelines, this functionality will be planned, designed, and built after the new vendor has come onboard. 
