# UmbNav Playwright E2E Tests - TODO

## Current Status

- ✅ **Completed:** 9 tests
- ⏳ **Outstanding:** 30 tests
- 📊 **Coverage:** ~20% → Target: 80%

---

## Phase 1: Critical Functionality (Must Have) 🔴

### Drag and Drop (4 tests)

- [ ] **drag-and-drop-reorder.spec.ts**
  - Test: Can reorder items via drag and drop
  - Steps: Add 3 items → Drag item 3 to position 1 → Verify order changed
  - Priority: CRITICAL

- [ ] **drag-and-drop-nested.spec.ts**
  - Test: Can drag item into another item to nest
  - Steps: Add 2 top-level items → Drag item 2 onto item 1 → Verify item 2 is child of item 1
  - Priority: CRITICAL

- [ ] **drag-and-drop-unnest.spec.ts**
  - Test: Can drag nested item to top level
  - Steps: Create nested structure → Drag child to top level → Verify no longer nested
  - Priority: CRITICAL

- [ ] **drag-and-drop-between-parents.spec.ts**
  - Test: Can drag item from one parent to another
  - Steps: Create Parent A with Child 1 → Create Parent B → Drag Child 1 to Parent B
  - Priority: CRITICAL

### Link Items - External & Media (3 tests)

- [ ] **add-external-link.spec.ts**
  - Test: Can add external link item
  - Steps: Click Add Link → Click "Link" tab → Enter URL and title → Verify item appears
  - Priority: HIGH

- [ ] **add-media-item.spec.ts**
  - Test: Can add media item
  - Steps: Click Add Link → Click "Media" tab → Select media file → Verify item appears
  - Priority: HIGH

- [ ] **edit-link-url.spec.ts**
  - Test: Can edit external link URL
  - Steps: Add external link → Edit it → Change URL → Verify URL updated
  - Priority: HIGH

### Delete Functionality (3 tests)

- [ ] **delete-item.spec.ts**
  - Test: Can delete top-level item
  - Steps: Add item → Click delete button → Verify item removed
  - Priority: HIGH

- [ ] **delete-nested-item.spec.ts**
  - Test: Can delete nested item without affecting parent
  - Steps: Create parent with child → Delete child → Verify parent exists, child gone
  - Priority: HIGH

- [ ] **delete-parent-with-children.spec.ts**
  - Test: Deleting parent also deletes all children
  - Steps: Create parent with 2 children → Delete parent → Verify all 3 items gone
  - Priority: HIGH

### Save and Persistence (2 tests)

- [ ] **save-and-reload.spec.ts**
  - Test: Menu items persist after save and reload
  - Steps: Add 3 items with various properties → Save → Reload → Verify all items present
  - Priority: CRITICAL

- [ ] **save-nested-structure.spec.ts**
  - Test: Nested structure persists correctly
  - Steps: Create complex nested structure (3 levels, 5 items) → Save → Reload → Verify structure
  - Priority: CRITICAL

**Phase 1 Total: 12 tests**

---

## Phase 2: Advanced Features (Should Have) 🟡

### Expand/Collapse (2 tests)

- [ ] **expand-collapse-item.spec.ts**
  - Test: Can expand and collapse items with children
  - Steps: Create item with children → Expand → Verify visible → Collapse → Verify hidden
  - Priority: MEDIUM

- [ ] **toggle-all-items-expand-collapse.spec.ts**
  - Test: Toggle all button expands and collapses all items
  - Steps: Create nested structure → Click toggle all → Verify all expanded → Click again → Verify collapsed
  - Priority: MEDIUM

### Advanced Properties (7 tests)

- [ ] **add-description.spec.ts**
  - Test: Can add description to item
  - Config: Enable AllowDescription
  - Steps: Add item with description → Verify description saved
  - Priority: MEDIUM

- [ ] **add-custom-classes.spec.ts**
  - Test: Can add custom CSS classes
  - Config: Enable AllowCustomClasses
  - Steps: Add item with classes "featured highlight" → Verify classes saved
  - Priority: MEDIUM

- [ ] **set-link-target.spec.ts**
  - Test: Can set link target to _blank with noopener/noreferrer
  - Steps: Add link → Set target="_blank" → Set noopener=true → Set noreferrer=true → Verify saved
  - Priority: MEDIUM

- [ ] **add-anchor.spec.ts**
  - Test: Can add anchor to link
  - Steps: Add content item → Add anchor "#section-1" → Verify anchor appended to URL
  - Priority: MEDIUM

- [ ] **add-image-icon.spec.ts**
  - Test: Can add image to item
  - Config: Enable AllowImageIcon
  - Steps: Add item → Select image from media picker → Verify image saved
  - Priority: MEDIUM

- [ ] **set-visibility-options.spec.ts**
  - Test: Can configure member visibility
  - Config: Enable EnableVisibility
  - Steps: Add item → Open visibility modal → Set hideLoggedIn=true → Verify saved
  - Priority: MEDIUM

- [ ] **include-child-nodes.spec.ts**
  - Test: Can enable include child nodes
  - Steps: Add content item with children → Enable "Include Child Nodes" → Verify saved
  - Priority: MEDIUM

### Configuration Options (3 tests)

- [ ] **max-depth-enforcement.spec.ts**
  - Test: MaxDepth prevents nesting beyond limit
  - Config: Set MaxDepth=2
  - Steps: Try to nest 3 levels deep → Verify 3rd level not allowed or warned
  - Priority: MEDIUM

- [ ] **auto-expand-on-hover.spec.ts**
  - Test: Auto expand works with delay
  - Config: Enable AutoExpand with 1000ms delay
  - Steps: Hover over item with children → Wait 1000ms → Verify auto-expanded
  - Priority: LOW

- [ ] **hide-navi-hide-items.spec.ts**
  - Test: Hides items with umbracoNaviHide property
  - Config: Enable HideNaviHide
  - Steps: Add content with umbracoNaviHide=true → Verify item not shown/grayed out
  - Priority: MEDIUM

**Phase 2 Total: 12 tests**

---

## Phase 3: Polish (Nice to Have) 🟢

### Modals (2 tests)

- [ ] **settings-modal.spec.ts**
  - Test: Can access and use settings modal
  - Steps: Add item → Click settings icon → Change settings → Save → Verify applied
  - Priority: LOW

- [ ] **cancel-modal.spec.ts**
  - Test: Cancel button discards modal changes
  - Steps: Edit item → Change properties → Click cancel → Verify changes not saved
  - Priority: LOW

### Error Handling (2 tests)

- [ ] **invalid-url-validation.spec.ts**
  - Test: Validates invalid URL format
  - Steps: Add external link → Enter invalid URL "not-a-url" → Verify validation error
  - Priority: LOW

- [ ] **max-length-validation.spec.ts**
  - Test: Validates field max lengths
  - Steps: Enter very long name (>500 chars) → Verify validation or truncation
  - Priority: LOW

### Accessibility (2 tests)

- [ ] **keyboard-navigation.spec.ts**
  - Test: Can navigate items with keyboard
  - Steps: Add 3 items → Use Tab to move → Use Enter to expand/collapse → Verify works
  - Priority: LOW

- [ ] **screen-reader-labels.spec.ts**
  - Test: Has proper ARIA labels
  - Steps: Add items → Verify aria-label attributes → Verify role attributes
  - Priority: LOW

**Phase 3 Total: 6 tests**

---

## Test Helper Creation (Prerequisite)

- [ ] **tests/helpers/umbnav-helpers.ts**
  - Create UmbNavTestHelper class with reusable methods:
    - `addContentItem(contentName: string)`
    - `addTextItem(text: string)`
    - `addExternalLink(url: string, title: string)`
    - `addMediaItem(mediaName: string)`
    - `dragItem(sourceIndex: number, targetIndex: number)`
    - `deleteItem(index: number)`
    - `expandItem(index: number)`
    - `collapseItem(index: number)`
    - `editItem(index: number, properties: object)`
    - `verifyItemExists(text: string)`
    - `verifyItemOrder(expectedOrder: string[])`
    - `verifyItemNested(parentText: string, childText: string)`
  - Priority: HIGH (Do this first!)

---

## Progress Tracking

### By Priority
- 🔴 **Critical (12 tests):** 0/12 complete (0%)
- 🟡 **Medium (12 tests):** 0/12 complete (0%)
- 🟢 **Low (6 tests):** 0/6 complete (0%)

### By Category
- **Drag & Drop:** 0/4 complete
- **Link Items:** 0/3 complete
- **Delete:** 0/3 complete
- **Persistence:** 0/2 complete
- **Expand/Collapse:** 0/2 complete
- **Advanced Properties:** 0/7 complete
- **Configuration:** 0/3 complete
- **Modals:** 0/2 complete
- **Error Handling:** 0/2 complete
- **Accessibility:** 0/2 complete

### Overall
- **Total Outstanding:** 30 tests
- **Total Completed:** 0/30 (0%)
- **Target Date:** TBD

---

## Notes

### Testing Environment Setup
- Ensure TestSite.V17 has content nodes for testing:
  - "Node" - for multi-level tests
  - "Node Single" - for single-level tests
  - "Node No Text Items" - for config tests
  - "Text Item with Link Children" - for text item tests
  - "Link Item with Link Children" - for link item tests
  - Add nodes for media and external link tests

### Common Issues to Watch For
1. **Timing:** Use `waitFor({ state: 'visible' })` before interactions
2. **Modal Handling:** Ensure modals are fully loaded before interacting
3. **Drag & Drop:** May need to use Playwright's dragTo() or custom drag implementation
4. **Save Operations:** Wait for save to complete before reloading
5. **Nested Structures:** Verify exact hierarchy, not just presence

### Test Data Naming Convention
- Use descriptive content names: "Test Content for X"
- Use consistent text patterns: "Test Text Item", "Test Link Item"
- Use recognizable URLs: "https://example.com/test-link"

---

## Completion Checklist

When completing a test:
1. [ ] Write test following existing patterns
2. [ ] Use UmbNavTestHelper where applicable
3. [ ] Add proper assertions (not just visibility)
4. [ ] Test both success and failure paths
5. [ ] Verify data persists after save
6. [ ] Add comments explaining complex interactions
7. [ ] Run test locally and verify it passes
8. [ ] Mark checkbox in this TODO
9. [ ] Update progress tracking section
10. [ ] Commit with message: "test: add [test-name] E2E test"

---

## Resources

- **Existing Tests:** `/tests/*.spec.ts` - Use as patterns
- **Playwright Docs:** https://playwright.dev/
- **Umbraco Test Helpers:** `@umbraco/playwright-testhelpers`
- **Component Docs:** `/src/components/*/README.md`
- **CLAUDE.MD:** `/CLAUDE.MD` - Full project context

---

*Last Updated: 2026-02-01*
*Maintained by: UmbNav Development Team*
