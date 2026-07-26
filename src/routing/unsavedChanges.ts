export const unsavedChangesMessage = '지금 나가면 저장되지 않아요.\n나가시겠습니까?'

export function confirmDiscardChanges(hasUnsavedChanges: boolean) {
  return !hasUnsavedChanges || window.confirm(unsavedChangesMessage)
}
