## Questions

### What issues, if any, did you find with the existing code?
The frontend withdrawal and deposit functions weren't handling the case where the response was a 400 error and were performing state updates regardless of the response. This was fixed by adding a check for the status code after the fetch call.
There also wasn't any validation that the entered amount was not negative so I added that to the API calls.

### What issues, if any, did you find with the request to add functionality?
There weren't any issues with adding the requested functionality.

### Would you modify the structure of this project if you were to start it over? If so, how?
N/A

### Were there any pieces of this project that you were not able to complete that you'd like to mention?
I tried running the build with `docker run build` but kept receiving the error:
`Unable to find image 'build:latest' locally
docker: Error response from daemon: pull access denied for build, repository does not exist or may require 'docker login'`

However running the project with `docker compose up -d` worked fine for getting the containers up and running.

### If you were to continue building this out, what would you like to add next?
I would add a frontend component like a Toast to display error messages returned from the backend regarding validation errors, and even including frontend validation for the rules that don't require information from the backend.
I would also add a component to display the history of transactions for the user's account since there is validation logic dependent on how many transactions have occurred in a day.
Similarly, because there is logic that prevents withdrawals/deposits dependending on the account type, I would add a component to display a message or label indicating the account type.

### If you have any other comments or info you'd like the reviewers to know, please add them below.
