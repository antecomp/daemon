import { createSignal } from "solid-js";
import generateDialogue from "@/tests/generateDialogue"; // Developer swaps this path to test different trees.
import type { DialogueNode, DialogueOption } from "@/core/dialogueNode";

/**
 * Recursively renders the dialogue tree with indentation and loop detection.
 */
function renderDialogueTree(node: DialogueNode, visited = new Set<string>(), depth = 0) {
    if (!node) return null;

    const indent = "  ".repeat(depth);
    const isLoop = visited.has(node.id);
    visited.add(node.id);

    return (
        <div style={{ "margin-left": `${depth * 20}px`, "border-left": "1px solid gray", "padding-left": "10px" }}>
            <strong>{node.name}:</strong>{" "}
            {typeof node.render === "function" ? <i>Custom render function</i> : node.render}

            {/* Handle loopbacks */}
            {isLoop ? (
                <div style={{ color: "red", "font-style": "italic" }}>↪ Link to: {node.id}</div>
            ) : (
                <>
                    {/* Render the next node directly below */}
                    {node.next && renderDialogueTree(node.next, visited, depth)}

                    {/* Render options as indented choices */}
                    {node.options.length > 0 && (
                        <div style={{ "margin-left": "20px", "padding-left": "10px", "border-left": "2px solid blue" }}>
                            {node.options.map((opt: DialogueOption) => (
                                <div>
                                    <strong>→ {opt.summaryText}</strong> ({opt.fullText})
                                    {renderDialogueTree(opt.next, visited, depth + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * Component to visualize a generated dialogue tree.
 */
const DialogueVisualizer = () => {
    const [dialogueRoot] = createSignal(generateDialogue()); // Generate dialogue tree once

    return (
        <div style={{ "font-family": "monospace", padding: "20px" }}>
            <h2>Dialogue Visualizer</h2>
            {renderDialogueTree(dialogueRoot())}
        </div>
    );
};

export default DialogueVisualizer;
