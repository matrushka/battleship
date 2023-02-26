<script lang="ts">
  import { gameState, mapState, restart, shipState, shoot, type BlockState } from "./state";
  import { numberToLetter, parseCoordinates } from "./utils";

  let textInput: HTMLInputElement;
  let formElement: HTMLFormElement;
  let inputFailed = false;

  const shootByCoordinate = (input: string) => {
    const [x, y] = parseCoordinates(input);

    if (x >= $gameState.width) throw new Error(`Invalid input: ${input}`);
    if (y >= $gameState.height) throw new Error(`Invalid input: ${input}`);

    shoot(x, y);
  };

  const onCoordinateSubmit = (e: SubmitEvent) => {
    try {
      shootByCoordinate(textInput.value.toUpperCase());
      inputFailed = false;
    } catch {
      inputFailed = true;
    } finally {
      formElement.reset();
    }
  };

  const onShoot = (x: number, y: number) => {
    if ($gameState.stage === "IN_PROGRESS") shoot(x, y);
  };

  const onToggleDebug = () => {
    debug = !debug;
  };

  let debug = false;
</script>

<h1>⚓️ BATTLESHIP ⚓️</h1>
<div class="wrapper">
  <main class:debug class="columnStack">
    <div class="column">
      <div class="block" />
      {#each $mapState[0] as block, y}
        <div class="block">{y + 1}</div>
      {/each}
    </div>
    {#each $mapState as row, x}
      <div class="column">
        <div class="block">{numberToLetter(x + 1)}</div>
        {#each row as block, y}
          <div class="block" on:click={() => onShoot(x, y)} class:hit={block.hit} title="{x},{y}">
            <div class="blockDisplay">
              {#if block.hit}
                {block.shipId === undefined ? "❌" : "✅"}
              {:else}
                ⬜️
              {/if}
            </div>
            <div class="blockDebug">{block.shipId || ""}</div>
          </div>
        {/each}
      </div>
    {/each}
  </main>
  <side>
    {#if $gameState.stage === "OVER"}
      <h2>GAME OVER!</h2>
      <button on:click={restart}>Restart</button>
    {:else}
      <h3>Intelligence</h3>
      {#each $shipState as state}
        <div>{state.type}: {state.isDown ? "DOWN" : "UP"}</div>
      {/each}
      <a class="cheatToggle" on:click|preventDefault={onToggleDebug} href="#"
        >Toggle super sonar (aka cheating).</a
      >
      <h3>Weapons System</h3>
      <form bind:this={formElement} on:submit|preventDefault={onCoordinateSubmit}>
        <p class="instructions">
          Enter coordinates (ex: C3) and press enter. You can also click the tiles.
        </p>
        <input type="text" bind:this={textInput} />
        {#if inputFailed}
          <p class="error">Make sure your input starts with a letter followed by a digit.</p>
        {/if}
      </form>
    {/if}
  </side>
</div>

<style>
  h1 {
    text-align: center;
  }

  .wrapper {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    flex-direction: row;
    margin: 0 auto;
  }

  main,
  side {
    background: #f5f5f5;
    padding: 1rem;
  }

  side {
    width: 15rem;
  }

  side input {
    width: 100%;
  }

  .instructions {
    color: #666;
    font-size: 75%;
  }

  .error {
    color: #f66;
    font-size: 85%;
  }

  .cheatToggle {
    font-size: 75%;
    text-decoration: underline;
    color: #333;
  }

  .columnStack {
    display: flex;
    gap: 0.25rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .block {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    position: relative;
  }

  .block.hit {
    cursor: none;
  }

  .blockDisplay {
    position: relative;
    font-size: 2rem;
  }

  .debug .blockDebug {
    display: flex;
  }

  .blockDebug {
    display: none;
    pointer-events: none;
    position: absolute;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
</style>
