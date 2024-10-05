<script context="module">
  import { v4 as uuidv4 } from "uuid";

  export const items = writable({
    doing: [],
    done: [],
  });

  export function upload(items) {
    fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });
  }
</script>

<script>
  import List from "./lib/List.svelte";
  import plus from "./assets/plus.svg";
  import trash from "./assets/trash.svg";
  import user from "./assets/user.svg";

  import { writable } from "svelte/store";

  (async () => {
    const res = await fetch("/api/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    try {
      $items = await res.json();
    } catch (e) {}

    console.log($items);
  })();

  /** @param {any} e */
  function addItem(e) {
    if (!e.target.value) return;

    e.preventDefault();
    $items.doing = [...$items.doing, { id: uuidv4(), title: e.target.value }];
    e.target.value = "";

    upload($items);
  }
</script>

<h3>doing</h3>
<List isDone={false} />
<div id="new" class="item">
  <img src={plus} alt="" />
  <input
    on:blur={addItem}
    on:keydown={(e) => e.key === "Enter" && addItem(e)}
    type="text"
    contenteditable
    placeholder="New task..."
  />
</div>
<h3>done</h3>
<List isDone />

<div id="delete" style="background-image: url({trash});">
  <List isDone isDelete />
</div>

<button
  on:click={async () => {
    const mail = prompt("Enter email and click on the verification link!");
    if (!mail) {
      alert("Invalid email!");
      return;
    }

    const res = await fetch("/api/mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mail }),
    });

    if (res.status === 500) {
      alert("Invalid email!");
      return;
    }

    alert("Verification link sent to " + mail + "!");
  }}
  id="user"
  style="background-image: url({user});"
></button>

<style>
  img {
    width: 1.2em;
    margin-right: 0.5em;
  }
  #new {
    display: flex;
    align-items: center;
    border: 1px dashed black;
    cursor: pointer;
  }
  #new input {
    all: unset;

    word-break: break-all;
    max-width: 8rem;
  }
  #delete {
    position: absolute;
    right: 0;
    top: 0;
    overflow: hidden;
    background-position: center;
    background-size: 1.2em;
    background-repeat: no-repeat;

    height: 8em;
    width: 8em;

    background-position-x: 5em;
    background-position-y: 2em;
  }
  #user {
    all: unset;
    cursor: pointer;

    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    background-position: center;
    background-size: 1.2em;
    background-repeat: no-repeat;

    height: 4em;
    width: 4em;
  }
</style>
