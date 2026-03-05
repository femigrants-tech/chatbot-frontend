# Testing Guide - View Documents Feature

## Quick Test Checklist ✅

Use this guide to verify the "View Documents" feature is working correctly.

## Prerequisites

### 1. Backend Running
```bash
cd ../Backend
python main.py
# Should see: "Server started on http://0.0.0.0:8000"
```

### 2. Frontend Running
```bash
cd Frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

### 3. Documents Uploaded
- At least 1-2 PDF files uploaded to the system
- Files should be in "Available" status (not "Processing" or "Failed")

## Test Cases

### ✅ Test 1: Basic Document Viewing

**Steps:**
1. Go to Chat page
2. Ask: "What information do you have?"
3. Wait for AI response

**Expected Result:**
- AI responds with an answer
- "📄 Sources (N)" section appears below the response
- Each source shows:
  - Document name
  - Relevance percentage
  - "View Details" button
  - Text preview

**Pass Criteria:**
- ✅ Sources section is visible
- ✅ At least one source is displayed
- ✅ "View Details" button is present

---

### ✅ Test 2: View Details Button

**Steps:**
1. Complete Test 1
2. Click "View Details" on the first source

**Expected Result:**
- New browser tab opens
- PDF document loads in the new tab
- Document matches the source name

**Pass Criteria:**
- ✅ New tab opens
- ✅ PDF loads successfully
- ✅ No errors in console

---

### ✅ Test 3: Multiple Sources

**Steps:**
1. Ask a question that retrieves multiple documents
2. Example: "Tell me everything you know"

**Expected Result:**
- Multiple source cards appear
- Each has its own "View Details" button
- Sources are ordered by relevance (highest first)

**Pass Criteria:**
- ✅ Multiple sources displayed
- ✅ Each has a working "View Details" button
- ✅ Relevance scores are in descending order

---

### ✅ Test 4: Source Metadata Display

**Steps:**
1. Look at any source card

**Expected Result:**
- **Document name** is clear and readable
- **Relevance score** shows as percentage (e.g., "93.5%")
- **Page numbers** appear if available (e.g., "Pages: 1, 2")
- **Text preview** shows first ~150 characters

**Pass Criteria:**
- ✅ All metadata is visible
- ✅ No "undefined" or "null" values
- ✅ Formatting is clean

---

### ✅ Test 5: Chat Context Preservation

**Steps:**
1. Ask: "Who founded Femigrants?"
2. Wait for response with sources
3. Ask follow-up: "When did that happen?"

**Expected Result:**
- Second response uses context from first question
- Sources appear for both responses
- Chat history is preserved

**Pass Criteria:**
- ✅ Follow-up question works
- ✅ Both responses have sources
- ✅ "View Details" works for all sources

---

### ✅ Test 6: Error Handling - No Document

**Steps:**
1. Manually modify a source's file_id in browser DevTools (optional)
2. Or wait for URL to expire (1 hour)
3. Click "View Details"

**Expected Result:**
- Error message appears
- Message is user-friendly
- Console shows error details (for debugging)

**Pass Criteria:**
- ✅ No app crash
- ✅ Error message is displayed
- ✅ Other buttons still work

---

### ✅ Test 7: Mobile Responsiveness

**Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select iPhone or Android device
4. Ask a question

**Expected Result:**
- Chat interface fits mobile screen
- Source cards are readable
- "View Details" buttons are accessible
- No horizontal scrolling

**Pass Criteria:**
- ✅ UI adapts to mobile screen
- ✅ All text is readable
- ✅ Buttons are tappable

---

### ✅ Test 8: Performance with Many Sources

**Steps:**
1. Ask a broad question to get many sources
2. Example: "Summarize all documents"

**Expected Result:**
- Page loads all sources without lag
- Scrolling is smooth
- "View Details" buttons respond quickly

**Pass Criteria:**
- ✅ No performance issues
- ✅ All sources render correctly
- ✅ Buttons are responsive

---

### ✅ Test 9: Clear Chat Function

**Steps:**
1. Ask several questions to build chat history
2. Click "Clear Chat" button

**Expected Result:**
- All messages disappear
- Chat returns to welcome state
- Example questions reappear

**Pass Criteria:**
- ✅ Chat clears successfully
- ✅ No errors occur
- ✅ Can ask new questions

---

### ✅ Test 10: API Integration

**Steps:**
1. Open Browser DevTools > Network tab
2. Ask a question
3. Look for the `/chat` request

**Expected Result:**
- Request payload includes: `message`, `chat_context`, `model`
- Response includes: `response`, `context_used`
- Each context item has: `text`, `score`, `file_id`, `signed_url`, `metadata`

**Pass Criteria:**
- ✅ Request structure is correct
- ✅ Response includes signed URLs
- ✅ All expected fields are present

---

## Quick Debugging

### Issue: No Sources Appear

**Check:**
1. Are documents uploaded? Go to Files page
2. Is backend running? Check terminal
3. Are documents processed? Check status is "Available"

**Solution:**
```bash
# Backend terminal
# Should show: "Retrieved N contexts from Pinecone"
```

---

### Issue: "View Details" Does Nothing

**Check:**
1. Browser console for errors (F12)
2. Pop-up blocker enabled?
3. Network request succeeds?

**Solution:**
- Allow pop-ups for localhost
- Check backend logs for errors
- Verify signed URLs are present

---

### Issue: Document Won't Open

**Check:**
1. Is signed_url in the response?
2. Is backend connected to GCS?
3. Has URL expired (>1 hour old)?

**Solution:**
```bash
# Test backend endpoint directly
curl http://localhost:8000/files/{file_id}/view-url

# Should return:
# {
#   "file_id": "...",
#   "signed_url": "https://...",
#   "expires_in": "1 hour"
# }
```

---

### Issue: Generic Errors

**Check:**
1. Console errors (F12 > Console)
2. Network errors (F12 > Network)
3. Backend logs in terminal

**Common Fixes:**
- Restart backend
- Clear browser cache
- Check API_BASE_URL in .env

---

## Automated Testing (Optional)

### Manual API Test

```bash
# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What topics are covered?",
    "chat_context": [],
    "model": "gemini-2.5-flash"
  }'

# Should return response with context_used array
```

### Test Signed URL Endpoint

```bash
# Get a file ID first
curl http://localhost:8000/files

# Then test view-url endpoint
curl http://localhost:8000/files/{FILE_ID}/view-url

# Should return signed URL
```

---

## Success Criteria Summary

Your implementation is working correctly if:

1. ✅ Chat responses include source cards
2. ✅ Source cards show document names, relevance, and pages
3. ✅ "View Details" buttons open PDFs in new tabs
4. ✅ Error handling works gracefully
5. ✅ UI is responsive on mobile
6. ✅ No console errors during normal operation
7. ✅ Chat context is preserved across messages
8. ✅ Multiple sources display correctly
9. ✅ All metadata displays properly
10. ✅ Performance is smooth with many sources

---

## Reporting Issues

If you find a bug, please note:

1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Console errors** (if any)
5. **Network requests** (from DevTools)
6. **Screenshot** (if UI issue)

Example Bug Report:
```
Bug: View Details button doesn't work

Steps:
1. Asked "Who founded Femigrants?"
2. Clicked "View Details" on first source
3. Nothing happened

Expected: PDF opens in new tab
Actual: Nothing happens

Console Error: "TypeError: Cannot read property 'signed_url' of undefined"

Screenshot: [attach screenshot]
```

---

## Next Steps After Testing

### If All Tests Pass ✅
- Deploy to staging environment
- Share with team for user testing
- Create user documentation

### If Issues Found ❌
- Document issues clearly
- Check this guide's debugging section
- Review implementation files
- Contact development team

---

Happy Testing! 🧪✨

**Tip:** Test in this order for best results:
1. Basic functionality (Tests 1-3)
2. Metadata and display (Tests 4-5)
3. Error handling (Test 6)
4. Special cases (Tests 7-10)

