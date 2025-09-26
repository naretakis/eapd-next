# 🧪 eAPD-Next Storage Layer Testing Checklist

This checklist will help you verify that the IndexedDB storage layer is working correctly. Follow these steps to test the functionality we just built.

## 📋 Pre-Testing Setup

### ✅ 1. Environment Check

- [ ] Node.js version 20+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Development server can start (`npm run dev`)

### ✅ 2. Browser Compatibility

- [ ] Modern browser (Chrome 58+, Firefox 55+, Safari 10+, Edge 79+)
- [ ] IndexedDB support enabled
- [ ] JavaScript enabled
- [ ] Not in private/incognito mode (some browsers restrict storage)

## 🧪 Automated Testing

### ✅ 3. Run Unit Tests

```bash
# Test the database service (28 tests)
npm test -- --testPathPatterns=database.test.ts --maxWorkers=1

# Test the APD service (23 tests)
npm test -- --testPathPatterns=apdService.test.ts --maxWorkers=1

# Test the version control service (20 tests)
npm test -- --testPathPatterns=versionControlService.test.ts --maxWorkers=1
```

**What to look for:**

- [ ] All tests pass (green ✅)
- [ ] No red error messages
- [ ] Test coverage reports show good coverage
- [ ] No memory leaks or timeouts

## 🌐 Manual Browser Testing

### ✅ 4. Use the Test Page

1. Start the development server: `npm run dev`
2. Visit: `http://localhost:3000/storage-test.html`
3. Run through the test sequence:

**Database Initialization:**

- [ ] Click "1. Initialize Database"
- [ ] Should see "Database connection established successfully"
- [ ] Status should turn green
- [ ] Next button should become enabled

**APD Operations:**

- [ ] Click "2. Test APD Operations"
- [ ] Should see "APD created successfully" with an ID
- [ ] Status should turn green
- [ ] Next button should become enabled

**Version Control:**

- [ ] Click "3. Test Version Control"
- [ ] Should see "Version created: v1.0"
- [ ] Should see commit message
- [ ] Status should turn green

**Project Management:**

- [ ] Click "4. Test Project Management"
- [ ] Should see "Project created: Test Project Group"
- [ ] Should see "APD associated with project"
- [ ] Status should turn green

**Storage Quota:**

- [ ] Click "5. Test Storage Quota"
- [ ] Should see storage quota information (MB available/used)
- [ ] Should see percentage used
- [ ] No warnings unless storage is actually low

**Backup/Restore:**

- [ ] Click "6. Test Backup/Restore"
- [ ] Should see "Backup created successfully" with file size
- [ ] Should see a download link appear
- [ ] Click the download link to get a JSON backup file

### ✅ 5. Browser Developer Tools Check

Open Developer Tools (F12) and check:

**Console Tab:**

- [ ] No red error messages
- [ ] Only expected log messages
- [ ] No uncaught exceptions

**Application Tab (Chrome) / Storage Tab (Firefox):**

- [ ] IndexedDB section shows "APDDatabase"
- [ ] Database contains tables: apds, apdVersions, workingCopies, etc.
- [ ] Tables contain test data after running tests

**Network Tab:**

- [ ] No failed network requests
- [ ] No 404 errors for missing files

## 🔍 Advanced Testing

### ✅ 6. Test Error Handling

Try these scenarios to test error handling:

**Offline Testing:**

- [ ] Disconnect internet
- [ ] Try to run tests (should still work - it's all local)
- [ ] Reconnect internet

**Storage Limits:**

- [ ] Check what happens with large amounts of data
- [ ] Verify cleanup functions work

**Browser Refresh:**

- [ ] Refresh the page after creating test data
- [ ] Data should persist between page loads
- [ ] IndexedDB should maintain data

### ✅ 7. Cross-Browser Testing

Test in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

## 🚨 Troubleshooting Common Issues

### ❌ If Tests Fail:

**"Database not initialized" errors:**

- Check browser console for detailed error messages
- Verify IndexedDB is supported and enabled
- Try clearing browser data and retrying

**Memory errors during testing:**

- Run tests individually instead of all at once
- Use `--maxWorkers=1` flag with Jest
- Close other browser tabs/applications

**Network errors:**

- Make sure you're using `http://localhost:3000` not `file://`
- Check that the development server is running
- Verify no firewall is blocking localhost

**Storage quota errors:**

- Clear browser data for localhost
- Check available disk space
- Try in a different browser

### ✅ Performance Checks

**Response Times:**

- [ ] Database operations complete in < 100ms
- [ ] Large data operations complete in < 1 second
- [ ] No noticeable UI freezing

**Memory Usage:**

- [ ] No memory leaks after repeated operations
- [ ] Browser memory usage stays reasonable
- [ ] No excessive garbage collection

## 📊 Success Criteria

You can consider the storage layer working correctly if:

✅ **All automated tests pass** (71 total tests)
✅ **Manual browser tests complete successfully**
✅ **Data persists between page refreshes**
✅ **No console errors during normal operation**
✅ **Storage quota information is accurate**
✅ **Backup/restore functionality works**
✅ **Cross-browser compatibility confirmed**

## 🎯 What Each Test Validates

### Database Service Tests (28 tests)

- IndexedDB connection and initialization
- CRUD operations for all data types
- Transaction handling and error recovery
- Storage quota management
- Backup/restore functionality

### APD Service Tests (23 tests)

- APD creation with templates
- Validation and business rules
- Project management and grouping
- Search and filtering
- Completion tracking

### Version Control Tests (20 tests)

- Working copy management
- Commit and version history
- Change tracking and comparison
- Revert and rollback functionality
- Diff generation

## 🔧 Next Steps

Once all tests pass, you can be confident that:

1. **The storage layer is solid** and ready for UI integration
2. **Data persistence works** across browser sessions
3. **Version control is functional** for tracking changes
4. **Business logic is implemented** correctly
5. **Error handling is robust** for production use

The storage layer is now ready to support the dashboard and APD editor components in the next development phase!
