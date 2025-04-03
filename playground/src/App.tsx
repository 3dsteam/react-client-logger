export default function App() {
    const creatInfoLog = () => {
        console.info("This is an info log");
    };

    const createWarnLog = () => {
        console.warn("This is a warn log");
    };

    const createErrorLog = () => {
        console.error("This is an error log");
    };

    const createException = () => {
        throw new Error("This is an error log");
    };

    return (
        <main>
            <h1>React Client Logger</h1>
            <hr />

            <p>
                This is a playground for the <code>react-client-logger</code> package.
            </p>

            <button onClick={creatInfoLog} style={{ marginRight: 10 }}>
                Create <b>info</b> log
            </button>

            <button onClick={createWarnLog} style={{ marginRight: 10 }}>
                Create <b>warn</b> log
            </button>

            <button onClick={createErrorLog} style={{ marginRight: 10 }}>
                Create <b>error</b> log
            </button>

            <button onClick={createException}>
                Create <b>throw</b> exception
            </button>
        </main>
    );
}
