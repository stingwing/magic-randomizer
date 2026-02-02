Web frontend for https://github.com/stingwing/SessionApp api where users can generate random pods for commander games at Local game stores.


About
This page is designed to help with creating semi-randomized pods for Commander using the following rules.

1. Generate the maximum number of pods of 4, but allow for pods of 3 depending on the number of players.

2. When generating a new round, if winners are selected, they will always be placed in the first pod.

3. If there are more than 4 winners, a new winner pod will be generated.

4. If the number of winners in a pod doesn't equal 4, other players will be randomly added.

5. Non-winning players will be randomly sorted into new pods, with priority on grouping players who have not played each other yet.

6. Players in pods of 3 will be prioritized for pods of 4 in future rounds.
