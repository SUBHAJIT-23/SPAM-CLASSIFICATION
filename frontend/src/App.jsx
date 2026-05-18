import { useEffect, useState } from "react";

function App() {
  const [samples, setSamples] = useState([]);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [displayText, setDisplayText] = useState("");

  const [confidence, setConfidence] = useState(null);
  const [risk, setRisk] = useState(0);
  const [spamWords, setSpamWords] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://spam-classification-uped.onrender.com/samples")
      .then((res) => res.json())
      .then((data) => setSamples(data.samples));
  }, []);

  const resetState = () => {
    setResult("");
    setDisplayText("");
    setConfidence(null);
    setRisk(0);
    setSpamWords([]);
  };

  const handleSample = (e) => {
    setEmail(e.target.value);
    resetState();
  };

  const checkSpam = async () => {
  if (!email.trim()) return;

  setLoading(true);
  resetState();

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await fetch(
      "https://spam-classification-uped.onrender.com/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: email }),
      }
    );

    const data = await response.json();
    const finalResult = data.prediction;
    setResult(finalResult);

    let currentText = "";
    let index = 0;
    const typingInterval = setInterval(() => {
      currentText += finalResult[index];

      setDisplayText(currentText);

      index++;

      if (index >= finalResult.length) {
        clearInterval(typingInterval);
      }
    }, 120);

    setConfidence(data.confidence);
    setRisk(data.risk);
    setSpamWords(data.spam_words);

  } catch (error) {
    console.error(error);
    alert("Backend Error");
  }

  setLoading(false);
};

  return (
    <div
      className={`
        min-h-screen
        flex
        items-center
        justify-center
        p-6
        transition-all
        duration-700

        ${
          result === "SPAM"
            ? "bg-red-100"
            : result === "GENUINE"
            ? "bg-green-100"
            : "bg-[#FFFFF0]"
        }
      `}
    >
      <div
        className={`
          bg-white
          w-full
          max-w-2xl
          p-8
          rounded-3xl
          border
          transition-all
          duration-500
          ease-in-out
          hover:scale-[1.015]

          ${
            result === "SPAM"
              ? "border-red-400 animate-redGlow"
              : result === "GENUINE"
              ? "border-green-400 animate-greenGlow"
              : "border-green-200 shadow-xl"
          }
        `}
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-2">
          SPAM SECURE
        </h1>

        <p className="text-center text-green-600 mb-6">
          Detect whether an email is spam or genuine
        </p>

        <select
          value={email}
          onChange={handleSample}
          className="
            w-full
            p-4
            rounded-xl
            border
            border-green-300
            mb-5
            transition-all
            duration-300
            ease-in-out
            hover:shadow-md
            hover:scale-[1.01]
            focus:outline-none
            focus:ring-2
            focus:ring-green-400
            focus:scale-[1.01]
          "
        >
          <option value="">Select Sample Email</option>

          {samples.map((sample, index) => (
            <option key={index} value={sample}>
              Email {index + 1}
            </option>
          ))}
        </select>

        <textarea
          rows="8"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            resetState();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              checkSpam();
            }
          }}
          placeholder="Enter email body here..."
          className="
            w-full
            p-4
            rounded-xl
            border
            border-green-300
            mb-5
            resize-none
            transition-all
            duration-300
            hover:shadow-md
            focus:outline-none
            focus:ring-2
            focus:ring-green-400
          "
        />

        <button
          onClick={checkSpam}
          disabled={loading}
          className="
            w-full
            bg-green-600
            enabled:hover:bg-green-700
            text-white
            font-bold
            py-4
            rounded-xl
            transition-all
            duration-300
            ease-in-out
            enabled:hover:scale-[1.02]
            active:scale-95
            hover:shadow-lg
            flex
            items-center
            justify-center
            gap-3
          "
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ANALYZING...
            </>
          ) : (
            "CHECK EMAIL"
          )}
        </button>

        {result && (
          <div className="mt-8 text-center animate-fadeIn">

            <div
              className={`
                text-3xl
                font-bold
                transition-all
                duration-500

                ${
                  result === "SPAM"
                    ? "text-red-600"
                    : "text-green-600"
                }
              `}
            >
              {displayText}
            </div>

            <div className="mt-3 text-lg text-gray-700">
              Confidence:{" "}
              <span className="font-bold">
                {confidence}%
              </span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>LOW RISK</span>
                <span>HIGH RISK</span>
              </div>

              <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full
                    transition-all
                    duration-1000

                    ${
                      result === "SPAM"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }
                  `}
                  style={{ width: `${risk}%` }}
                ></div>
              </div>
            </div>

            {spamWords.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-red-500 mb-2">
                  Detected Suspicious Words
                </h3>

                <div className="flex flex-wrap justify-center gap-2">
                  {spamWords.map((word, index) => (
                    <span
                      key={index}
                      className="
                        px-3
                        py-1
                        bg-red-100
                        text-red-600
                        rounded-full
                        text-sm
                        font-semibold
                      "
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;