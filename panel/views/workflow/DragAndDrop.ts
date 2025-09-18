import type { ActionOptionItem } from '@src/types/action-types'
import { ref, shallowRef } from 'vue'


/**
 * In a real world scenario you'd want to avoid creating refs in a global scope like this as they might not be cleaned up properly.
 */
const state = {
  /**
   * The type of the node being dragged.
   */
  draggedAction: shallowRef<ActionOptionItem | null>(null),
  isDragOver: ref(false),
  isDragging: ref(false),
}

export default function useDragAndDrop() {
  const { draggedAction, isDragOver, isDragging } = state

  // const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

  // watch(isDragging, (dragging) => {
  //   document.body.style.userSelect = dragging ? 'none' : ''
  // })

  function onDragStart(event, type) {
    // console.debug('onDragStart')
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedAction.value = type
    isDragging.value = true

    document.addEventListener('drop', onDragEnd)
  }

  function onDragOver(event: DragEvent) {
    // console.debug('onDragOver')
    event.preventDefault()

    if (draggedAction.value) {
      isDragOver.value = true

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    // console.debug('onDragLeave')
    isDragOver.value = false
  }

  function onDragEnd() {
    // console.debug('onDragEnd')
    isDragging.value = false
    isDragOver.value = false
    draggedAction.value = null
    document.removeEventListener('drop', onDragEnd)
  }

  return {
    draggedAction,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    // onDrop,
    // onDroppedItem
  }
}
