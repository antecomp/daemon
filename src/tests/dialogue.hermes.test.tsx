import { test, expect } from "vitest"
import { render } from "@solidjs/testing-library"
import userEvent from "@testing-library/user-event"
import Hermes from "@/layers/hermes/Hermes"
import { createDialogueNode } from "@/core/dialogue/dialogueNode"

const user = userEvent.setup()

test("init test", async () => {
  const testTree = createDialogueNode("Root Node", "Root Name")
  const { getByRole, container } = render(() => <Hermes root={testTree} />)

  const x = container.querySelector('.hermes-container')
  console.log(x)
  expect(x).toBeTruthy()    

  //const counter = getByRole('button')
  //expect(counter).toHaveTextContent("1")
  //await user.click(counter)
  //expect(counter).toHaveTextContent("2")
})