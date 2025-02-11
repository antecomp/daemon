import { createSignal } from "solid-js";
import type { DialogueNode, DialogueOption } from "@/core/dialogue/dialogueNode.types";
import './dialogue-visualizer.css'
import root from "@/tests/generateDialogue"; // Swap this out to test different dialogue components.

/**
 * Simple dialogue tree visualizer used for testing/debugging composed dialogue.
 * Also reference /tests/generateDialogue for the script that forwards a dialogue root to this component.
 * 
 * To view this test tree in-dev, navigate to http://localhost:5173/dialogue.html
 */
function renderDialogueTree(node: DialogueNode, visited = new Set<string>(), depth = 0) {
    if (!node) return null;

    //const indent = "  ".repeat(depth);
    const isLoop = visited.has(node.id);
    visited.add(node.id);

    const isLeaf = !node.next && node.options.length === 0;

    return (
        <div>
            [{node.id.substring(5)}] <strong>{node.name}:</strong>{" "}
            {typeof node.render === "function" ? <i>Custom render function</i> : node.render}

            {isLeaf && <span style={{ color: "red" }}> 🍃</span>}
            {node.sideEffect && <i>[runs side effect]</i>}

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
                                    <div style={{"padding-left": `${20 * (depth + 1)}px`}}>
                                        {opt.next ? renderDialogueTree(opt.next, visited, depth + 1) : "🍂"}
                                    </div>
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
    const [dialogueRoot] = createSignal(root);

    return (
        <div style={{ "font-family": "monospace", padding: "20px" }}>
            <h2>Dialogue Visualizer</h2>
            {renderDialogueTree(dialogueRoot())}
        </div>
    );
};

export default DialogueVisualizer;
