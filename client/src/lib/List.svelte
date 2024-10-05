<script>
	import { dndzone } from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	const flipDurationMs = 200;

	import { upload, items } from "../App.svelte";

	export let isDone;

	function handleSort(e) {
		if (isDelete) {
			const id = e.detail.info.id;

			upload($items);

			return;
		}

		if (isDone) {
			$items.done = e.detail.items;
		} else {
			$items.doing = e.detail.items;
		}

		upload($items);
	}

	export let isDelete = false;
</script>

<section
	use:dndzone={{
		items: !isDelete ? (isDone ? $items.done : $items.doing) : [],
		flipDurationMs,
		dropTargetStyle: {},
	}}
	on:consider={isDelete ? {} : handleSort}
	on:finalize={handleSort}
	class={isDelete ? "delete" : ""}
>
	{#each !isDelete ? (isDone ? $items.done : $items.doing) : [] as item (item.id)}
		<div class="item" animate:flip={{ duration: flipDurationMs }}>
			{item.title}
		</div>
	{/each}
</section>

<style>
	section {
		min-height: 2em;
	}
	.delete {
		height: 8em !important;
		width: 8em !important;

		overflow: visible;
	}
</style>
