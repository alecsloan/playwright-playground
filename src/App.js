import {useState} from "react";
import './styles/App.css';

function App() {
  const [error, setError] = useState()
  const [isCanceling, setIsCanceling] = useState(false)
  const [success, setSuccess] = useState()
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleCancelChatGPT = async () => {
    setError("")
    setSuccess(undefined)
    setIsCanceling(true)

    fetch('http://localhost:8080', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password
      })
    }).then(async (response) => {
      const { error, success } = await response.json();

      if (success !== undefined) {
        setError(error);
        setIsCanceling(false);
        setSuccess(success);
      }
    }).catch((error) => {
      console.log(error);

      setError("Couldn't process cancellation");
      setIsCanceling(false);
      setSuccess(false);
    })
  };
  const handleUsernameChange = (event) => setUsername(event.target.value)
  const handlePasswordChange = (event) => setPassword(event.target.value)

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: 5 }}>
            <span style={{ marginRight: 5 }}>Username</span>
            <input onChange={handleUsernameChange} value={username} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: 5 }}>
            <span style={{ marginRight: 5 }}>Password</span>
            <input onChange={handlePasswordChange} type="password" value={password} />
          </div>
        </div>

        {
          isCanceling ? (
            <>
              <div className="loader" />
            </>
          ) : success ? (
            <p style={{ color: 'limegreen' }}>
              ✅ Successfully Canceled Your Subscription.
            </p>
          ) : (
            <>
              <p>
                Choose a service to cancel 👇
              </p>

              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <button
                  className={`button ${(!username || !password) ? "disabled" : ""}`}
                  disabled={!username || !password}
                  onClick={handleCancelChatGPT}
                >
                  <img
                    alt="OpenAI Logo"
                    height={25}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png"
                    style={{ marginRight: 5 }}
                  />

                  ChatGPT
                </button>

                <button className="button disabled" disabled>
                  <img
                    alt="OpenAI Logo"
                    height={25}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/1200px-Hulu_Logo.svg.png"
                    style={{ marginRight: 5 }}
                  />
                </button>
              </div>
            </>
          )
        }

        {
          !success && error && (
            <small style={{ color: 'red', fontSize: 16 }}>
              {error}
            </small>
          )
        }
      </header>
    </div>
  );
}

export default App;
