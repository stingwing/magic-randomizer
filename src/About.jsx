export default function About() {
    return (
        <div style={{ textAlign: "left" }}>
            <h2>About</h2>
            <p>This page is designed to help with creating semi-randomized pods for Commander using the following rules.</p>
            <p>1. Generate the maximum number of pods of 4, but allow for pods of 3 depending on the number of players.</p>
            <p>2. When generating a new round, if winners are selected, they will always be placed in the first pod.</p>
            <p>3. If there are more than 4 winners, a new winner pod will be generated.</p>
            <p>4. If the number of winners in a pod doesn't equal 4, other players will be randomly added.</p>
            <p>5. Non-winning players will be randomly sorted into new pods, with priority on grouping players who have not played each other yet.</p>
            <p>6. Players in pods of 3 will be prioritized for pods of 4 in future rounds.</p>
        </div>
    );
}