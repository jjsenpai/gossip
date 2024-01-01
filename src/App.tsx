import { Component } from "solid-js";

const App: Component = () => {
  return (
    <header class="h-screen bg-gradient-to-b from-gray-500 to-slate-800 flex flex-col text-white p-20">
      <h1 class="text-5xl font-bold text-center mb-2">Gossip</h1>
      <p class="text-center mb-6 text-xl">
        If you like this project, consider giving it a star on GitHub!
      </p>
      <div class="flex flex-row justify-center items-center gap-4">
        <a
          class="github-button text-indigo-300 font-bold"
          href="https://github.com/andrejjurkin/create-tw"
          data-color-scheme="no-preference: dark; light: dark; dark: dark;"
          data-icon="octicon-star"
          data-size="large"
          data-show-count="true"
          aria-label="Star andrejjurkin/create-tw on GitHub"
        >
          Star
        </a>
        <a
          class="github-button text-indigo-300 font-bold"
          href="https://github.com/andrejjurkin/create-tw/discussions"
          data-color-scheme="no-preference: dark; light: dark; dark: dark;"
          data-icon="octicon-comment-discussion"
          data-size="large"
          aria-label="Discuss andrejjurkin/create-tw on GitHub"
        >
          Discuss
        </a>
      </div>
    </header>
  );
};

export default App;
