var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { EventEmitter } from '@angular/core';
import { FileLikeObject } from './file-like-object.class';
import { FileItem } from './file-item.class';
import { FileType } from './file-type.class';
/**
 * @param {?} value
 * @return {?}
 */
function isFile(value) {
    return (File && value instanceof File);
}
/**
 * @record
 */
export function Headers() { }
if (false) {
    /** @type {?} */
    Headers.prototype.name;
    /** @type {?} */
    Headers.prototype.value;
}
/**
 * @record
 */
export function FileUploaderOptions() { }
if (false) {
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.allowedMimeType;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.allowedFileType;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.autoUpload;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.isHTML5;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.filters;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.headers;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.method;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.authToken;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.maxFileSize;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.queueLimit;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.removeAfterUpload;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.url;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.disableMultipart;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.itemAlias;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.authTokenHeader;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.additionalParameter;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.parametersBeforeFiles;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.formatDataFunction;
    /** @type {?|undefined} */
    FileUploaderOptions.prototype.formatDataFunctionIsAsync;
}
var FileUploader = /** @class */ (function () {
    function FileUploader(options) {
        this.isUploading = false;
        this.queue = [];
        this.progress = 0;
        this._nextIndex = 0;
        this.options = {
            autoUpload: false,
            isHTML5: true,
            filters: [],
            removeAfterUpload: false,
            disableMultipart: false,
            formatDataFunction: (/**
             * @param {?} item
             * @return {?}
             */
            function (item) { return item._file; }),
            formatDataFunctionIsAsync: false
        };
        this.setOptions(options);
        this.response = new EventEmitter();
    }
    /**
     * @param {?} options
     * @return {?}
     */
    FileUploader.prototype.setOptions = /**
     * @param {?} options
     * @return {?}
     */
    function (options) {
        this.options = Object.assign(this.options, options);
        this.authToken = this.options.authToken;
        this.authTokenHeader = this.options.authTokenHeader || 'Authorization';
        this.autoUpload = this.options.autoUpload;
        this.options.filters.unshift({ name: 'queueLimit', fn: this._queueLimitFilter });
        if (this.options.maxFileSize) {
            this.options.filters.unshift({ name: 'fileSize', fn: this._fileSizeFilter });
        }
        if (this.options.allowedFileType) {
            this.options.filters.unshift({ name: 'fileType', fn: this._fileTypeFilter });
        }
        if (this.options.allowedMimeType) {
            this.options.filters.unshift({ name: 'mimeType', fn: this._mimeTypeFilter });
        }
        for (var i = 0; i < this.queue.length; i++) {
            this.queue[i].url = this.options.url;
        }
    };
    /**
     * @param {?} files
     * @param {?=} options
     * @param {?=} filters
     * @return {?}
     */
    FileUploader.prototype.addToQueue = /**
     * @param {?} files
     * @param {?=} options
     * @param {?=} filters
     * @return {?}
     */
    function (files, options, filters) {
        var e_1, _a;
        var _this = this;
        /** @type {?} */
        var list = [];
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var file = files_1_1.value;
                list.push(file);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        /** @type {?} */
        var arrayOfFilters = this._getFilters(filters);
        /** @type {?} */
        var count = this.queue.length;
        /** @type {?} */
        var addedFileItems = [];
        list.map((/**
         * @param {?} some
         * @return {?}
         */
        function (some) {
            if (!options) {
                options = _this.options;
            }
            /** @type {?} */
            var temp = new FileLikeObject(some);
            _this._isValidFile(temp, arrayOfFilters, options).then((/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                var fileItem = new FileItem(_this, some, options);
                addedFileItems.push(fileItem);
                _this.queue.push(fileItem);
                _this._onAfterAddingFile(fileItem);
            })).catch((/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                var filter = arrayOfFilters[_this._failFilterIndex];
                _this._onWhenAddingFileFailed(temp, filter, options);
            }));
        }));
        if (this.queue.length !== count) {
            this._onAfterAddingAll(addedFileItems);
            this.progress = this._getTotalProgress();
        }
        this._render();
        if (this.options.autoUpload) {
            this.uploadAll();
        }
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.removeFromQueue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var index = this.getIndexOfItem(value);
        /** @type {?} */
        var item = this.queue[index];
        if (item.isUploading) {
            item.cancel();
        }
        this.queue.splice(index, 1);
        this.progress = this._getTotalProgress();
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.clearQueue = /**
     * @return {?}
     */
    function () {
        while (this.queue.length) {
            this.queue[0].remove();
        }
        this.progress = 0;
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.uploadItem = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var index = this.getIndexOfItem(value);
        /** @type {?} */
        var item = this.queue[index];
        /** @type {?} */
        var transport = this.options.isHTML5 ? '_xhrTransport' : '_iframeTransport';
        item._prepareToUploading();
        if (this.isUploading) {
            return;
        }
        this.isUploading = true;
        ((/** @type {?} */ (this)))[transport](item);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.cancelItem = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var index = this.getIndexOfItem(value);
        /** @type {?} */
        var item = this.queue[index];
        /** @type {?} */
        var prop = this.options.isHTML5 ? item._xhr : item._form;
        if (item && item.isUploading) {
            prop.abort();
        }
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.uploadAll = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var items = this.getNotUploadedItems().filter((/**
         * @param {?} item
         * @return {?}
         */
        function (item) { return !item.isUploading; }));
        if (!items.length) {
            return;
        }
        items.map((/**
         * @param {?} item
         * @return {?}
         */
        function (item) { return item._prepareToUploading(); }));
        items[0].upload();
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.cancelAll = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var items = this.getNotUploadedItems();
        items.map((/**
         * @param {?} item
         * @return {?}
         */
        function (item) { return item.cancel(); }));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.isFile = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return isFile(value);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.isFileLikeObject = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return value instanceof FileLikeObject;
    };
    /**
     * @param {?} value
     * @return {?}
     */
    FileUploader.prototype.getIndexOfItem = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return typeof value === 'number' ? value : this.queue.indexOf(value);
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.getNotUploadedItems = /**
     * @return {?}
     */
    function () {
        return this.queue.filter((/**
         * @param {?} item
         * @return {?}
         */
        function (item) { return !item.isUploaded; }));
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.getReadyItems = /**
     * @return {?}
     */
    function () {
        return this.queue
            .filter((/**
         * @param {?} item
         * @return {?}
         */
        function (item) { return (item.isReady && !item.isUploading); }))
            .sort((/**
         * @param {?} item1
         * @param {?} item2
         * @return {?}
         */
        function (item1, item2) { return item1.index - item2.index; }));
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.destroy = /**
     * @return {?}
     */
    function () {
        return void 0;
    };
    /**
     * @param {?} fileItems
     * @return {?}
     */
    FileUploader.prototype.onAfterAddingAll = /**
     * @param {?} fileItems
     * @return {?}
     */
    function (fileItems) {
        return { fileItems: fileItems };
    };
    /**
     * @param {?} fileItem
     * @param {?} form
     * @return {?}
     */
    FileUploader.prototype.onBuildItemForm = /**
     * @param {?} fileItem
     * @param {?} form
     * @return {?}
     */
    function (fileItem, form) {
        return { fileItem: fileItem, form: form };
    };
    /**
     * @param {?} fileItem
     * @return {?}
     */
    FileUploader.prototype.onAfterAddingFile = /**
     * @param {?} fileItem
     * @return {?}
     */
    function (fileItem) {
        return { fileItem: fileItem };
    };
    /**
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    FileUploader.prototype.onWhenAddingFileFailed = /**
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    function (item, filter, options) {
        return { item: item, filter: filter, options: options };
    };
    /**
     * @param {?} fileItem
     * @return {?}
     */
    FileUploader.prototype.onBeforeUploadItem = /**
     * @param {?} fileItem
     * @return {?}
     */
    function (fileItem) {
        return { fileItem: fileItem };
    };
    /**
     * @param {?} fileItem
     * @param {?} progress
     * @return {?}
     */
    FileUploader.prototype.onProgressItem = /**
     * @param {?} fileItem
     * @param {?} progress
     * @return {?}
     */
    function (fileItem, progress) {
        return { fileItem: fileItem, progress: progress };
    };
    /**
     * @param {?} progress
     * @return {?}
     */
    FileUploader.prototype.onProgressAll = /**
     * @param {?} progress
     * @return {?}
     */
    function (progress) {
        return { progress: progress };
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype.onSuccessItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        return { item: item, response: response, status: status, headers: headers };
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype.onErrorItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        return { item: item, response: response, status: status, headers: headers };
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype.onCancelItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        return { item: item, response: response, status: status, headers: headers };
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype.onCompleteItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        return { item: item, response: response, status: status, headers: headers };
    };
    /**
     * @return {?}
     */
    FileUploader.prototype.onCompleteAll = /**
     * @return {?}
     */
    function () {
        return void 0;
    };
    /**
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._mimeTypeFilter = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        return !(this.options.allowedMimeType && this.options.allowedMimeType.indexOf(item.type) === -1);
    };
    /**
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._fileSizeFilter = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        return !(this.options.maxFileSize && item.size > this.options.maxFileSize);
    };
    /**
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._fileTypeFilter = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        return !(this.options.allowedFileType &&
            this.options.allowedFileType.indexOf(FileType.getMimeClass(item)) === -1);
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._onErrorItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        item._onError(response, status, headers);
        this.onErrorItem(item, response, status, headers);
    };
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._onCompleteItem = /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        item._onComplete(response, status, headers);
        this.onCompleteItem(item, response, status, headers);
        /** @type {?} */
        var nextItem = this.getReadyItems()[0];
        this.isUploading = false;
        if (nextItem) {
            nextItem.upload();
            return;
        }
        this.onCompleteAll();
        this.progress = this._getTotalProgress();
        this._render();
    };
    /**
     * @protected
     * @param {?} parsedHeaders
     * @return {?}
     */
    FileUploader.prototype._headersGetter = /**
     * @protected
     * @param {?} parsedHeaders
     * @return {?}
     */
    function (parsedHeaders) {
        return (/**
         * @param {?} name
         * @return {?}
         */
        function (name) {
            if (name) {
                return parsedHeaders[name.toLowerCase()] || void 0;
            }
            return parsedHeaders;
        });
    };
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._xhrTransport = /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    function (item) {
        var e_2, _a, e_3, _b;
        var _this = this;
        /** @type {?} */
        var that = this;
        /** @type {?} */
        var xhr = item._xhr = new XMLHttpRequest();
        /** @type {?} */
        var sendable;
        this._onBeforeUploadItem(item);
        if (typeof item._file.size !== 'number') {
            throw new TypeError('The file specified is no longer valid');
        }
        if (!this.options.disableMultipart) {
            sendable = new FormData();
            this._onBuildItemForm(item, sendable);
            /** @type {?} */
            var appendFile = (/**
             * @return {?}
             */
            function () { return sendable.append(item.alias, item._file, item.file.name); });
            if (!this.options.parametersBeforeFiles) {
                appendFile();
            }
            // For AWS, Additional Parameters must come BEFORE Files
            if (this.options.additionalParameter !== undefined) {
                Object.keys(this.options.additionalParameter).forEach((/**
                 * @param {?} key
                 * @return {?}
                 */
                function (key) {
                    /** @type {?} */
                    var paramVal = _this.options.additionalParameter[key];
                    // Allow an additional parameter to include the filename
                    if (typeof paramVal === 'string' && paramVal.indexOf('{{file_name}}') >= 0) {
                        paramVal = paramVal.replace('{{file_name}}', item.file.name);
                    }
                    sendable.append(key, paramVal);
                }));
            }
            if (this.options.parametersBeforeFiles) {
                appendFile();
            }
        }
        else {
            sendable = this.options.formatDataFunction(item);
        }
        xhr.upload.onprogress = (/**
         * @param {?} event
         * @return {?}
         */
        function (event) {
            /** @type {?} */
            var progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
            _this._onProgressItem(item, progress);
        });
        xhr.onload = (/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var headers = _this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            var response = _this._transformResponse(xhr.response, headers);
            /** @type {?} */
            var gist = _this._isSuccessCode(xhr.status) ? 'Success' : 'Error';
            /** @type {?} */
            var method = '_on' + gist + 'Item';
            ((/** @type {?} */ (_this)))[method](item, response, xhr.status, headers);
            _this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.onerror = (/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var headers = _this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            var response = _this._transformResponse(xhr.response, headers);
            _this._onErrorItem(item, response, xhr.status, headers);
            _this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.onabort = (/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var headers = _this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            var response = _this._transformResponse(xhr.response, headers);
            _this._onCancelItem(item, response, xhr.status, headers);
            _this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.open(item.method, item.url, true);
        xhr.withCredentials = item.withCredentials;
        if (this.options.headers) {
            try {
                for (var _c = __values(this.options.headers), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var header = _d.value;
                    xhr.setRequestHeader(header.name, header.value);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (item.headers.length) {
            try {
                for (var _e = __values(item.headers), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var header = _f.value;
                    xhr.setRequestHeader(header.name, header.value);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        if (this.authToken) {
            xhr.setRequestHeader(this.authTokenHeader, this.authToken);
        }
        xhr.onreadystatechange = (/**
         * @return {?}
         */
        function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                that.response.emit(xhr.responseText);
            }
        });
        if (this.options.formatDataFunctionIsAsync) {
            sendable.then((/**
             * @param {?} result
             * @return {?}
             */
            function (result) { return xhr.send(JSON.stringify(result)); }));
        }
        else {
            xhr.send(sendable);
        }
        this._render();
    };
    /**
     * @protected
     * @param {?=} value
     * @return {?}
     */
    FileUploader.prototype._getTotalProgress = /**
     * @protected
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        if (value === void 0) { value = 0; }
        if (this.options.removeAfterUpload) {
            return value;
        }
        /** @type {?} */
        var notUploaded = this.getNotUploadedItems().length;
        /** @type {?} */
        var uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
        /** @type {?} */
        var ratio = 100 / this.queue.length;
        /** @type {?} */
        var current = value * ratio / 100;
        return Math.round(uploaded * ratio + current);
    };
    /**
     * @protected
     * @param {?} filters
     * @return {?}
     */
    FileUploader.prototype._getFilters = /**
     * @protected
     * @param {?} filters
     * @return {?}
     */
    function (filters) {
        if (!filters) {
            return this.options.filters;
        }
        if (Array.isArray(filters)) {
            return filters;
        }
        if (typeof filters === 'string') {
            /** @type {?} */
            var names_1 = filters.match(/[^\s,]+/g);
            return this.options.filters
                .filter((/**
             * @param {?} filter
             * @return {?}
             */
            function (filter) { return names_1.indexOf(filter.name) !== -1; }));
        }
        return this.options.filters;
    };
    /**
     * @protected
     * @return {?}
     */
    FileUploader.prototype._render = /**
     * @protected
     * @return {?}
     */
    function () {
        return void 0;
    };
    /**
     * @protected
     * @return {?}
     */
    FileUploader.prototype._queueLimitFilter = /**
     * @protected
     * @return {?}
     */
    function () {
        return this.options.queueLimit === undefined || this.queue.length < this.options.queueLimit;
    };
    /**
     * @protected
     * @param {?} file
     * @param {?} filters
     * @param {?} options
     * @return {?}
     */
    FileUploader.prototype._isValidFile = /**
     * @protected
     * @param {?} file
     * @param {?} filters
     * @param {?} options
     * @return {?}
     */
    function (file, filters, options) {
        var _this = this;
        this._failFilterIndex = -1;
        return Promise.all(filters.map((/**
         * @param {?} filter
         * @return {?}
         */
        function (filter) {
            /** @type {?} */
            var isValid = filter.fn.call(_this, file, options);
            return Promise.resolve(isValid);
        }))).then((/**
         * @param {?} values
         * @return {?}
         */
        function (values) {
            /** @type {?} */
            var isValid = values.every((/**
             * @param {?} value
             * @return {?}
             */
            function (value) {
                _this._failFilterIndex++;
                return value;
            }));
            return isValid
                ? Promise.resolve(isValid)
                : Promise.reject(isValid);
        }));
    };
    /**
     * @protected
     * @param {?} status
     * @return {?}
     */
    FileUploader.prototype._isSuccessCode = /**
     * @protected
     * @param {?} status
     * @return {?}
     */
    function (status) {
        return (status >= 200 && status < 300) || status === 304;
    };
    /**
     * @protected
     * @param {?} response
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._transformResponse = /**
     * @protected
     * @param {?} response
     * @param {?} headers
     * @return {?}
     */
    function (response, headers) {
        return response;
    };
    /**
     * @protected
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._parseHeaders = /**
     * @protected
     * @param {?} headers
     * @return {?}
     */
    function (headers) {
        /** @type {?} */
        var parsed = {};
        /** @type {?} */
        var key;
        /** @type {?} */
        var val;
        /** @type {?} */
        var i;
        if (!headers) {
            return parsed;
        }
        headers.split('\n').map((/**
         * @param {?} line
         * @return {?}
         */
        function (line) {
            i = line.indexOf(':');
            key = line.slice(0, i).trim().toLowerCase();
            val = line.slice(i + 1).trim();
            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        }));
        return parsed;
    };
    /**
     * @protected
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    FileUploader.prototype._onWhenAddingFileFailed = /**
     * @protected
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    function (item, filter, options) {
        this.onWhenAddingFileFailed(item, filter, options);
    };
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._onAfterAddingFile = /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    function (item) {
        this.onAfterAddingFile(item);
    };
    /**
     * @protected
     * @param {?} items
     * @return {?}
     */
    FileUploader.prototype._onAfterAddingAll = /**
     * @protected
     * @param {?} items
     * @return {?}
     */
    function (items) {
        this.onAfterAddingAll(items);
    };
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    FileUploader.prototype._onBeforeUploadItem = /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    function (item) {
        item._onBeforeUpload();
        this.onBeforeUploadItem(item);
    };
    /**
     * @protected
     * @param {?} item
     * @param {?} form
     * @return {?}
     */
    FileUploader.prototype._onBuildItemForm = /**
     * @protected
     * @param {?} item
     * @param {?} form
     * @return {?}
     */
    function (item, form) {
        item._onBuildForm(form);
        this.onBuildItemForm(item, form);
    };
    /**
     * @protected
     * @param {?} item
     * @param {?} progress
     * @return {?}
     */
    FileUploader.prototype._onProgressItem = /**
     * @protected
     * @param {?} item
     * @param {?} progress
     * @return {?}
     */
    function (item, progress) {
        /** @type {?} */
        var total = this._getTotalProgress(progress);
        this.progress = total;
        item._onProgress(progress);
        this.onProgressItem(item, progress);
        this.onProgressAll(total);
        this._render();
    };
    /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._onSuccessItem = /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        item._onSuccess(response, status, headers);
        this.onSuccessItem(item, response, status, headers);
    };
    /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    FileUploader.prototype._onCancelItem = /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    function (item, response, status, headers) {
        item._onCancel(response, status, headers);
        this.onCancelItem(item, response, status, headers);
    };
    return FileUploader;
}());
export { FileUploader };
if (false) {
    /** @type {?} */
    FileUploader.prototype.authToken;
    /** @type {?} */
    FileUploader.prototype.isUploading;
    /** @type {?} */
    FileUploader.prototype.queue;
    /** @type {?} */
    FileUploader.prototype.progress;
    /** @type {?} */
    FileUploader.prototype._nextIndex;
    /** @type {?} */
    FileUploader.prototype.autoUpload;
    /** @type {?} */
    FileUploader.prototype.authTokenHeader;
    /** @type {?} */
    FileUploader.prototype.response;
    /** @type {?} */
    FileUploader.prototype.options;
    /**
     * @type {?}
     * @protected
     */
    FileUploader.prototype._failFilterIndex;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWRlci5jbGFzcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nMi1maWxlLXVwbG9hZC8iLCJzb3VyY2VzIjpbImZpbGUtdXBsb2FkL2ZpbGUtdXBsb2FkZXIuY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7OztBQUU3QyxTQUFTLE1BQU0sQ0FBQyxLQUFVO0lBQ3hCLE9BQU8sQ0FBQyxJQUFJLElBQUksS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDO0FBQ3pDLENBQUM7Ozs7QUFFRCw2QkFHQzs7O0lBRkMsdUJBQWE7O0lBQ2Isd0JBQWM7Ozs7O0FBVWhCLHlDQW9CQzs7O0lBbkJDLDhDQUEyQjs7SUFDM0IsOENBQTJCOztJQUMzQix5Q0FBcUI7O0lBQ3JCLHNDQUFrQjs7SUFDbEIsc0NBQTJCOztJQUMzQixzQ0FBb0I7O0lBQ3BCLHFDQUFnQjs7SUFDaEIsd0NBQW1COztJQUNuQiwwQ0FBcUI7O0lBQ3JCLHlDQUFvQjs7SUFDcEIsZ0RBQTRCOztJQUM1QixrQ0FBYTs7SUFDYiwrQ0FBMkI7O0lBQzNCLHdDQUFtQjs7SUFDbkIsOENBQXlCOztJQUN6QixrREFBK0M7O0lBQy9DLG9EQUFnQzs7SUFDaEMsaURBQThCOztJQUM5Qix3REFBb0M7O0FBR3RDO0lBdUJFLHNCQUFtQixPQUE0QjtRQXBCeEMsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFDN0IsVUFBSyxHQUFlLEVBQUUsQ0FBQztRQUN2QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFLdkIsWUFBTyxHQUF3QjtZ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VUFBeUIsSUFBYyxFQUFFLFFBQWdCLEVBQUUsTUFBYyxFQUFFLE9BQThCO1FBQ3ZHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7Ozs7Ozs7OztJQUVTLG9DQUFhOzs7Ozs7OztJQUF2QixVQUF3QixJQUFjLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsT0FBOEI7UUFDdEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQXBkRCxJQW9kQzs7OztJQWxkQyxpQ0FBeUI7O0lBQ3pCLG1DQUFvQzs7SUFDcEMsNkJBQThCOztJQUM5QixnQ0FBNEI7O0lBQzVCLGtDQUE4Qjs7SUFDOUIsa0NBQXVCOztJQUN2Qix1Q0FBK0I7O0lBQy9CLGdDQUFtQzs7SUFFbkMsK0JBUUU7Ozs7O0lBRUYsd0NBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWxlTGlrZU9iamVjdCB9IGZyb20gJy4vZmlsZS1saWtlLW9iamVjdC5jbGFzcyc7XG5pbXBvcnQgeyBGaWxlSXRlbSB9IGZyb20gJy4vZmlsZS1pdGVtLmNsYXNzJztcbmltcG9ydCB7IEZpbGVUeXBlIH0gZnJvbSAnLi9maWxlLXR5cGUuY2xhc3MnO1xuXG5mdW5jdGlvbiBpc0ZpbGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKEZpbGUgJiYgdmFsdWUgaW5zdGFuY2VvZiBGaWxlKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFkZXJzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQYXJzZWRSZXNwb25zZUhlYWRlcnMgPSB7IFsgaGVhZGVyRmllbGROYW1lOiBzdHJpbmcgXTogc3RyaW5nIH07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIGZuOiAoaXRlbT86IEZpbGVMaWtlT2JqZWN0LCBvcHRpb25zPzogRmlsZVVwbG9hZGVyT3B0aW9ucykgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj5cbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVVwbG9hZGVyT3B0aW9ucyB7XG4gIGFsbG93ZWRNaW1lVHlwZT86IHN0cmluZ1tdO1xuICBhbGxvd2VkRmlsZVR5cGU/OiBzdHJpbmdbXTtcbiAgYXV0b1VwbG9hZD86IGJvb2xlYW47XG4gIGlzSFRNTDU/OiBib29sZWFuO1xuICBmaWx0ZXJzPzogRmlsdGVyRnVuY3Rpb25bXTtcbiAgaGVhZGVycz86IEhlYWRlcnNbXTtcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBhdXRoVG9rZW4/OiBzdHJpbmc7XG4gIG1heEZpbGVTaXplPzogbnVtYmVyO1xuICBxdWV1ZUxpbWl0PzogbnVtYmVyO1xuICByZW1vdmVBZnRlclVwbG9hZD86IGJvb2xlYW47XG4gIHVybD86IHN0cmluZztcbiAgZGlzYWJsZU11bHRpcGFydD86IGJvb2xlYW47XG4gIGl0ZW1BbGlhcz86IHN0cmluZztcbiAgYXV0aFRva2VuSGVhZGVyPzogc3RyaW5nO1xuICBhZGRpdGlvbmFsUGFyYW1ldGVyPzogeyBbIGtleTogc3RyaW5nIF06IGFueSB9O1xuICBwYXJhbWV0ZXJzQmVmb3JlRmlsZXM/OiBib29sZWFuO1xuICBmb3JtYXREYXRhRnVuY3Rpb24/OiBGdW5jdGlvbjtcbiAgZm9ybWF0RGF0YUZ1bmN0aW9uSXNBc3luYz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBGaWxlVXBsb2FkZXIge1xuXG4gIHB1YmxpYyBhdXRoVG9rZW46IHN0cmluZztcbiAgcHVibGljIGlzVXBsb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBxdWV1ZTogRmlsZUl0ZW1bXSA9IFtdO1xuICBwdWJsaWMgcHJvZ3Jlc3M6IG51bWJlciA9IDA7XG4gIHB1YmxpYyBfbmV4dEluZGV4OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgYXV0b1VwbG9hZDogYW55O1xuICBwdWJsaWMgYXV0aFRva2VuSGVhZGVyOiBzdHJpbmc7XG4gIHB1YmxpYyByZXNwb25zZTogRXZlbnRFbWl0dGVyPGFueT47XG5cbiAgcHVibGljIG9wdGlvbnM6IEZpbGVVcGxvYWRlck9wdGlvbnMgPSB7XG4gICAgYXV0b1VwbG9hZDogZmFsc2UsXG4gICAgaXNIVE1MNTogdHJ1ZSxcbiAgICBmaWx0ZXJzOiBbXSxcbiAgICByZW1vdmVBZnRlclVwbG9hZDogZmFsc2UsXG4gICAgZGlzYWJsZU11bHRpcGFydDogZmFsc2UsXG4gICAgZm9ybWF0RGF0YUZ1bmN0aW9uOiAoaXRlbTogRmlsZUl0ZW0pID0+IGl0ZW0uX2ZpbGUsXG4gICAgZm9ybWF0RGF0YUZ1bmN0aW9uSXNBc3luYzogZmFsc2VcbiAgfTtcblxuICBwcm90ZWN0ZWQgX2ZhaWxGaWx0ZXJJbmRleDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBGaWxlVXBsb2FkZXJPcHRpb25zKSB7XG4gICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMucmVzcG9uc2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnM6IEZpbGVVcGxvYWRlck9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmF1dGhUb2tlbiA9IHRoaXMub3B0aW9ucy5hdXRoVG9rZW47XG4gICAgdGhpcy5hdXRoVG9rZW5IZWFkZXIgPSB0aGlzLm9wdGlvbnMuYXV0aFRva2VuSGVhZGVyIHx8ICdBdXRob3JpemF0aW9uJztcbiAgICB0aGlzLmF1dG9VcGxvYWQgPSB0aGlzLm9wdGlvbnMuYXV0b1VwbG9hZDtcbiAgICB0aGlzLm9wdGlvbnMuZmlsdGVycy51bnNoaWZ0KHsgbmFtZTogJ3F1ZXVlTGltaXQnLCBmbjogdGhpcy5fcXVldWVMaW1pdEZpbHRlciB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnZmlsZVNpemUnLCBmbjogdGhpcy5fZmlsZVNpemVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnZmlsZVR5cGUnLCBmbjogdGhpcy5fZmlsZVR5cGVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd2VkTWltZVR5cGUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnbWltZVR5cGUnLCBmbjogdGhpcy5fbWltZVR5cGVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnF1ZXVlWyBpIF0udXJsID0gdGhpcy5vcHRpb25zLnVybDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWRkVG9RdWV1ZShmaWxlczogRmlsZVtdLCBvcHRpb25zPzogRmlsZVVwbG9hZGVyT3B0aW9ucywgZmlsdGVycz86IEZpbHRlckZ1bmN0aW9uW10gfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgbGlzdDogRmlsZVtdID0gW107XG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGlzdC5wdXNoKGZpbGUpO1xuICAgIH1cbiAgICBsZXQgYXJyYXlPZkZpbHRlcnMgPSB0aGlzLl9nZXRGaWx0ZXJzKGZpbHRlcnMpO1xuICAgIGxldCBjb3VudCA9IHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCBhZGRlZEZpbGVJdGVtczogRmlsZUl0ZW1bXSA9IFtdO1xuICAgIGxpc3QubWFwKChzb21lOiBGaWxlKSA9PiB7XG4gICAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIH1cblxuICAgICAgbGV0IHRlbXAgPSBuZXcgRmlsZUxpa2VPYmplY3Qoc29tZSk7XG5cbiAgICAgIHRoaXMuX2lzVmFsaWRGaWxlKHRlbXAsIGFycmF5T2ZGaWx0ZXJzLCBvcHRpb25zKS50aGVuKCgpID0+IHtcbiAgICAgICAgbGV0IGZpbGVJdGVtID0gbmV3IEZpbGVJdGVtKHRoaXMsIHNvbWUsIG9wdGlvbnMpO1xuICAgICAgICBhZGRlZEZpbGVJdGVtcy5wdXNoKGZpbGVJdGVtKTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGZpbGVJdGVtKTtcbiAgICAgICAgdGhpcy5fb25BZnRlckFkZGluZ0ZpbGUoZmlsZUl0ZW0pO1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICBsZXQgZmlsdGVyID0gYXJyYXlPZkZpbHRlcnNbdGhpcy5fZmFpbEZpbHRlckluZGV4XTtcbiAgICAgICAgdGhpcy5fb25XaGVuQWRkaW5nRmlsZUZhaWxlZCh0ZW1wLCBmaWx0ZXIsIG9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoICE9PSBjb3VudCkge1xuICAgICAgdGhpcy5fb25BZnRlckFkZGluZ0FsbChhZGRlZEZpbGVJdGVtcyk7XG4gICAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICAgIH1cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9VcGxvYWQpIHtcbiAgICAgIHRoaXMudXBsb2FkQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbW92ZUZyb21RdWV1ZSh2YWx1ZTogRmlsZUl0ZW0pOiB2b2lkIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLmdldEluZGV4T2ZJdGVtKHZhbHVlKTtcbiAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbIGluZGV4IF07XG4gICAgaWYgKGl0ZW0uaXNVcGxvYWRpbmcpIHtcbiAgICAgIGl0ZW0uY2FuY2VsKCk7XG4gICAgfVxuICAgIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICB9XG5cbiAgcHVibGljIGNsZWFyUXVldWUoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLnF1ZXVlWyAwIF0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICB9XG5cbiAgcHVibGljIHVwbG9hZEl0ZW0odmFsdWU6IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5nZXRJbmRleE9mSXRlbSh2YWx1ZSk7XG4gICAgbGV0IGl0ZW0gPSB0aGlzLnF1ZXVlWyBpbmRleCBdO1xuICAgIGxldCB0cmFuc3BvcnQgPSB0aGlzLm9wdGlvbnMuaXNIVE1MNSA/ICdfeGhyVHJhbnNwb3J0JyA6ICdfaWZyYW1lVHJhbnNwb3J0JztcbiAgICBpdGVtLl9wcmVwYXJlVG9VcGxvYWRpbmcoKTtcbiAgICBpZiAodGhpcy5pc1VwbG9hZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmlzVXBsb2FkaW5nID0gdHJ1ZTtcbiAgICAodGhpcyBhcyBhbnkpWyB0cmFuc3BvcnQgXShpdGVtKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxJdGVtKHZhbHVlOiBGaWxlSXRlbSk6IHZvaWQge1xuICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SW5kZXhPZkl0ZW0odmFsdWUpO1xuICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVsgaW5kZXggXTtcbiAgICBsZXQgcHJvcCA9IHRoaXMub3B0aW9ucy5pc0hUTUw1ID8gaXRlbS5feGhyIDogaXRlbS5fZm9ybTtcbiAgICBpZiAoaXRlbSAmJiBpdGVtLmlzVXBsb2FkaW5nKSB7XG4gICAgICBwcm9wLmFib3J0KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwbG9hZEFsbCgpOiB2b2lkIHtcbiAgICBsZXQgaXRlbXMgPSB0aGlzLmdldE5vdFVwbG9hZGVkSXRlbXMoKS5maWx0ZXIoKGl0ZW06IEZpbGVJdGVtKSA9PiAhaXRlbS5pc1VwbG9hZGluZyk7XG4gICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbXMubWFwKChpdGVtOiBGaWxlSXRlbSkgPT4gaXRlbS5fcHJlcGFyZVRvVXBsb2FkaW5nKCkpO1xuICAgIGl0ZW1zWyAwIF0udXBsb2FkKCk7XG4gIH1cblxuICBwdWJsaWMgY2FuY2VsQWxsKCk6IHZvaWQge1xuICAgIGxldCBpdGVtcyA9IHRoaXMuZ2V0Tm90VXBsb2FkZWRJdGVtcygpO1xuICAgIGl0ZW1zLm1hcCgoaXRlbTogRmlsZUl0ZW0pID0+IGl0ZW0uY2FuY2VsKCkpO1xuICB9XG5cbiAgcHVibGljIGlzRmlsZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmlsZSh2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgaXNGaWxlTGlrZU9iamVjdCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRmlsZUxpa2VPYmplY3Q7XG4gIH1cblxuICBwdWJsaWMgZ2V0SW5kZXhPZkl0ZW0odmFsdWU6IGFueSk6IG51bWJlciB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IHRoaXMucXVldWUuaW5kZXhPZih2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Tm90VXBsb2FkZWRJdGVtcygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUuZmlsdGVyKChpdGVtOiBGaWxlSXRlbSkgPT4gIWl0ZW0uaXNVcGxvYWRlZCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVhZHlJdGVtcygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVldWVcbiAgICAgIC5maWx0ZXIoKGl0ZW06IEZpbGVJdGVtKSA9PiAoaXRlbS5pc1JlYWR5ICYmICFpdGVtLmlzVXBsb2FkaW5nKSlcbiAgICAgIC5zb3J0KChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBpdGVtMS5pbmRleCAtIGl0ZW0yLmluZGV4KTtcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwdWJsaWMgb25BZnRlckFkZGluZ0FsbChmaWxlSXRlbXM6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW1zIH07XG4gIH1cblxuICBwdWJsaWMgb25CdWlsZEl0ZW1Gb3JtKGZpbGVJdGVtOiBGaWxlSXRlbSwgZm9ybTogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBmaWxlSXRlbSwgZm9ybSB9O1xuICB9XG5cbiAgcHVibGljIG9uQWZ0ZXJBZGRpbmdGaWxlKGZpbGVJdGVtOiBGaWxlSXRlbSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW0gfTtcbiAgfVxuXG4gIHB1YmxpYyBvbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW06IEZpbGVMaWtlT2JqZWN0LCBmaWx0ZXI6IGFueSwgb3B0aW9uczogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBpdGVtLCBmaWx0ZXIsIG9wdGlvbnMgfTtcbiAgfVxuXG4gIHB1YmxpYyBvbkJlZm9yZVVwbG9hZEl0ZW0oZmlsZUl0ZW06IEZpbGVJdGVtKTogYW55IHtcbiAgICByZXR1cm4geyBmaWxlSXRlbSB9O1xuICB9XG5cbiAgcHVibGljIG9uUHJvZ3Jlc3NJdGVtKGZpbGVJdGVtOiBGaWxlSXRlbSwgcHJvZ3Jlc3M6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW0sIHByb2dyZXNzIH07XG4gIH1cblxuICBwdWJsaWMgb25Qcm9ncmVzc0FsbChwcm9ncmVzczogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBwcm9ncmVzcyB9O1xuICB9XG5cbiAgcHVibGljIG9uU3VjY2Vzc0l0ZW0oaXRlbTogRmlsZUl0ZW0sIHJlc3BvbnNlOiBzdHJpbmcsIHN0YXR1czogbnVtYmVyLCBoZWFkZXJzOiBQYXJzZWRSZXNwb25zZUhlYWRlcnMpOiBhbnkge1xuICAgIHJldHVybiB7IGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMgfTtcbiAgfVxuXG4gIHB1YmxpYyBvbkVycm9ySXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIHsgaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyB9O1xuICB9XG5cbiAgcHVibGljIG9uQ2FuY2VsSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIHsgaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyB9O1xuICB9XG5cbiAgcHVibGljIG9uQ29tcGxldGVJdGVtKGl0ZW06IEZpbGVJdGVtLCByZXNwb25zZTogc3RyaW5nLCBzdGF0dXM6IG51bWJlciwgaGVhZGVyczogUGFyc2VkUmVzcG9uc2VIZWFkZXJzKTogYW55IHtcbiAgICByZXR1cm4geyBpdGVtLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzIH07XG4gIH1cblxuICBwdWJsaWMgb25Db21wbGV0ZUFsbCgpOiBhbnkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwdWJsaWMgX21pbWVUeXBlRmlsdGVyKGl0ZW06IEZpbGVMaWtlT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEodGhpcy5vcHRpb25zLmFsbG93ZWRNaW1lVHlwZSAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZE1pbWVUeXBlLmluZGV4T2YoaXRlbS50eXBlKSA9PT0gLTEpO1xuICB9XG5cbiAgcHVibGljIF9maWxlU2l6ZUZpbHRlcihpdGVtOiBGaWxlTGlrZU9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhKHRoaXMub3B0aW9ucy5tYXhGaWxlU2l6ZSAmJiBpdGVtLnNpemUgPiB0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUpO1xuICB9XG5cbiAgcHVibGljIF9maWxlVHlwZUZpbHRlcihpdGVtOiBGaWxlTGlrZU9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhKHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUgJiZcbiAgICAgIHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUuaW5kZXhPZihGaWxlVHlwZS5nZXRNaW1lQ2xhc3MoaXRlbSkpID09PSAtMSk7XG4gIH1cblxuICBwdWJsaWMgX29uRXJyb3JJdGVtKGl0ZW06IEZpbGVJdGVtLCByZXNwb25zZTogc3RyaW5nLCBzdGF0dXM6IG51bWJlciwgaGVhZGVyczogUGFyc2VkUmVzcG9uc2VIZWFkZXJzKTogdm9pZCB7XG4gICAgaXRlbS5fb25FcnJvcihyZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICB0aGlzLm9uRXJyb3JJdGVtKGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICB9XG5cbiAgcHVibGljIF9vbkNvbXBsZXRlSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uQ29tcGxldGUocmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyk7XG4gICAgdGhpcy5vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLmdldFJlYWR5SXRlbXMoKVsgMCBdO1xuICAgIHRoaXMuaXNVcGxvYWRpbmcgPSBmYWxzZTtcbiAgICBpZiAobmV4dEl0ZW0pIHtcbiAgICAgIG5leHRJdGVtLnVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9uQ29tcGxldGVBbGwoKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9oZWFkZXJzR2V0dGVyKHBhcnNlZEhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIChuYW1lOiBhbnkpOiBhbnkgPT4ge1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZEhlYWRlcnNbIG5hbWUudG9Mb3dlckNhc2UoKSBdIHx8IHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJzZWRIZWFkZXJzO1xuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgX3hoclRyYW5zcG9ydChpdGVtOiBGaWxlSXRlbSk6IGFueSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCB4aHIgPSBpdGVtLl94aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBsZXQgc2VuZGFibGU6IGFueTtcbiAgICB0aGlzLl9vbkJlZm9yZVVwbG9hZEl0ZW0oaXRlbSk7XG5cbiAgICBpZiAodHlwZW9mIGl0ZW0uX2ZpbGUuc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBmaWxlIHNwZWNpZmllZCBpcyBubyBsb25nZXIgdmFsaWQnKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZU11bHRpcGFydCkge1xuICAgICAgc2VuZGFibGUgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIHRoaXMuX29uQnVpbGRJdGVtRm9ybShpdGVtLCBzZW5kYWJsZSk7XG5cbiAgICAgIGNvbnN0IGFwcGVuZEZpbGUgPSAoKSA9PiBzZW5kYWJsZS5hcHBlbmQoaXRlbS5hbGlhcywgaXRlbS5fZmlsZSwgaXRlbS5maWxlLm5hbWUpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyYW1ldGVyc0JlZm9yZUZpbGVzKSB7XG4gICAgICAgIGFwcGVuZEZpbGUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIEFXUywgQWRkaXRpb25hbCBQYXJhbWV0ZXJzIG11c3QgY29tZSBCRUZPUkUgRmlsZXNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWRkaXRpb25hbFBhcmFtZXRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMub3B0aW9ucy5hZGRpdGlvbmFsUGFyYW1ldGVyKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGxldCBwYXJhbVZhbCA9IHRoaXMub3B0aW9ucy5hZGRpdGlvbmFsUGFyYW1ldGVyWyBrZXkgXTtcbiAgICAgICAgICAvLyBBbGxvdyBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciB0byBpbmNsdWRlIHRoZSBmaWxlbmFtZVxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1WYWwgPT09ICdzdHJpbmcnICYmIHBhcmFtVmFsLmluZGV4T2YoJ3t7ZmlsZV9uYW1lfX0nKSA+PSAwKSB7XG4gICAgICAgICAgICBwYXJhbVZhbCA9IHBhcmFtVmFsLnJlcGxhY2UoJ3t7ZmlsZV9uYW1lfX0nLCBpdGVtLmZpbGUubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbmRhYmxlLmFwcGVuZChrZXksIHBhcmFtVmFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyYW1ldGVyc0JlZm9yZUZpbGVzKSB7XG4gICAgICAgIGFwcGVuZEZpbGUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VuZGFibGUgPSB0aGlzLm9wdGlvbnMuZm9ybWF0RGF0YUZ1bmN0aW9uKGl0ZW0pO1xuICAgIH1cblxuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChldmVudDogYW55KSA9PiB7XG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBNYXRoLnJvdW5kKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUgPyBldmVudC5sb2FkZWQgKiAxMDAgLyBldmVudC50b3RhbCA6IDApO1xuICAgICAgdGhpcy5fb25Qcm9ncmVzc0l0ZW0oaXRlbSwgcHJvZ3Jlc3MpO1xuICAgIH07XG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gICAgICBsZXQgcmVzcG9uc2UgPSB0aGlzLl90cmFuc2Zvcm1SZXNwb25zZSh4aHIucmVzcG9uc2UsIGhlYWRlcnMpO1xuICAgICAgbGV0IGdpc3QgPSB0aGlzLl9pc1N1Y2Nlc3NDb2RlKHhoci5zdGF0dXMpID8gJ1N1Y2Nlc3MnIDogJ0Vycm9yJztcbiAgICAgIGxldCBtZXRob2QgPSAnX29uJyArIGdpc3QgKyAnSXRlbSc7XG4gICAgICAodGhpcyBhcyBhbnkpWyBtZXRob2QgXShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgICB0aGlzLl9vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgfTtcbiAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gICAgICBsZXQgcmVzcG9uc2UgPSB0aGlzLl90cmFuc2Zvcm1SZXNwb25zZSh4aHIucmVzcG9uc2UsIGhlYWRlcnMpO1xuICAgICAgdGhpcy5fb25FcnJvckl0ZW0oaXRlbSwgcmVzcG9uc2UsIHhoci5zdGF0dXMsIGhlYWRlcnMpO1xuICAgICAgdGhpcy5fb25Db21wbGV0ZUl0ZW0oaXRlbSwgcmVzcG9uc2UsIHhoci5zdGF0dXMsIGhlYWRlcnMpO1xuICAgIH07XG4gICAgeGhyLm9uYWJvcnQgPSAoKSA9PiB7XG4gICAgICBsZXQgaGVhZGVycyA9IHRoaXMuX3BhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAgICAgbGV0IHJlc3BvbnNlID0gdGhpcy5fdHJhbnNmb3JtUmVzcG9uc2UoeGhyLnJlc3BvbnNlLCBoZWFkZXJzKTtcbiAgICAgIHRoaXMuX29uQ2FuY2VsSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgICB0aGlzLl9vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgfTtcbiAgICB4aHIub3BlbihpdGVtLm1ldGhvZCwgaXRlbS51cmwsIHRydWUpO1xuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBpdGVtLndpdGhDcmVkZW50aWFscztcbiAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgIGZvciAobGV0IGhlYWRlciBvZiB0aGlzLm9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIubmFtZSwgaGVhZGVyLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGl0ZW0uaGVhZGVycy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGhlYWRlciBvZiBpdGVtLmhlYWRlcnMpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLm5hbWUsIGhlYWRlci52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmF1dGhUb2tlbikge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIodGhpcy5hdXRoVG9rZW5IZWFkZXIsIHRoaXMuYXV0aFRva2VuKTtcbiAgICB9XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgIHRoYXQucmVzcG9uc2UuZW1pdCh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmZvcm1hdERhdGFGdW5jdGlvbklzQXN5bmMpIHtcbiAgICAgIHNlbmRhYmxlLnRoZW4oXG4gICAgICAgIChyZXN1bHQ6IGFueSkgPT4geGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5zZW5kKHNlbmRhYmxlKTtcbiAgICB9XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldFRvdGFsUHJvZ3Jlc3ModmFsdWU6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3ZlQWZ0ZXJVcGxvYWQpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgbGV0IG5vdFVwbG9hZGVkID0gdGhpcy5nZXROb3RVcGxvYWRlZEl0ZW1zKCkubGVuZ3RoO1xuICAgIGxldCB1cGxvYWRlZCA9IG5vdFVwbG9hZGVkID8gdGhpcy5xdWV1ZS5sZW5ndGggLSBub3RVcGxvYWRlZCA6IHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCByYXRpbyA9IDEwMCAvIHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCBjdXJyZW50ID0gdmFsdWUgKiByYXRpbyAvIDEwMDtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh1cGxvYWRlZCAqIHJhdGlvICsgY3VycmVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldEZpbHRlcnMoZmlsdGVyczogRmlsdGVyRnVuY3Rpb25bXSB8IHN0cmluZyk6IEZpbHRlckZ1bmN0aW9uW10ge1xuICAgIGlmICghZmlsdGVycykge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXJzO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmaWx0ZXJzKSkge1xuICAgICAgcmV0dXJuIGZpbHRlcnM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZmlsdGVycyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBuYW1lcyA9IGZpbHRlcnMubWF0Y2goL1teXFxzLF0rL2cpO1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXJzXG4gICAgICAgIC5maWx0ZXIoKGZpbHRlcjogYW55KSA9PiBuYW1lcy5pbmRleE9mKGZpbHRlci5uYW1lKSAhPT0gLTEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZpbHRlcnM7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3JlbmRlcigpOiBhbnkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3F1ZXVlTGltaXRGaWx0ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5xdWV1ZUxpbWl0ID09PSB1bmRlZmluZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGggPCB0aGlzLm9wdGlvbnMucXVldWVMaW1pdDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfaXNWYWxpZEZpbGUoZmlsZTpGaWxlTGlrZU9iamVjdCwgZmlsdGVyczpGaWx0ZXJGdW5jdGlvbltdLCBvcHRpb25zOkZpbGVVcGxvYWRlck9wdGlvbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLl9mYWlsRmlsdGVySW5kZXggPSAtMTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIGZpbHRlcnMubWFwKChmaWx0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IGZpbHRlci5mbi5jYWxsKHRoaXMsIGZpbGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaXNWYWxpZCk7XG4gICAgICB9KVxuICAgICkudGhlbigodmFsdWVzKSA9PiB7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gdmFsdWVzLmV2ZXJ5KCh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLl9mYWlsRmlsdGVySW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBpc1ZhbGlkXG4gICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaXNWYWxpZClcbiAgICAgICAgICA6IFByb21pc2UucmVqZWN0KGlzVmFsaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9pc1N1Y2Nlc3NDb2RlKHN0YXR1czogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCkgfHwgc3RhdHVzID09PSAzMDQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3RyYW5zZm9ybVJlc3BvbnNlKHJlc3BvbnNlOiBzdHJpbmcsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9wYXJzZUhlYWRlcnMoaGVhZGVyczogc3RyaW5nKTogUGFyc2VkUmVzcG9uc2VIZWFkZXJzIHtcbiAgICBsZXQgcGFyc2VkOiBhbnkgPSB7fTtcbiAgICBsZXQga2V5OiBhbnk7XG4gICAgbGV0IHZhbDogYW55O1xuICAgIGxldCBpOiBhbnk7XG4gICAgaWYgKCFoZWFkZXJzKSB7XG4gICAgICByZXR1cm4gcGFyc2VkO1xuICAgIH1cbiAgICBoZWFkZXJzLnNwbGl0KCdcXG4nKS5tYXAoKGxpbmU6IGFueSkgPT4ge1xuICAgICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgICAga2V5ID0gbGluZS5zbGljZSgwLCBpKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhbCA9IGxpbmUuc2xpY2UoaSArIDEpLnRyaW0oKTtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgcGFyc2VkWyBrZXkgXSA9IHBhcnNlZFsga2V5IF0gPyBwYXJzZWRbIGtleSBdICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcGFyc2VkO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9vbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW06IEZpbGVMaWtlT2JqZWN0LCBmaWx0ZXI6IGFueSwgb3B0aW9uczogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW0sIGZpbHRlciwgb3B0aW9ucyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX29uQWZ0ZXJBZGRpbmdGaWxlKGl0ZW06IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgdGhpcy5vbkFmdGVyQWRkaW5nRmlsZShpdGVtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25BZnRlckFkZGluZ0FsbChpdGVtczogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vbkFmdGVyQWRkaW5nQWxsKGl0ZW1zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25CZWZvcmVVcGxvYWRJdGVtKGl0ZW06IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgaXRlbS5fb25CZWZvcmVVcGxvYWQoKTtcbiAgICB0aGlzLm9uQmVmb3JlVXBsb2FkSXRlbShpdGVtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25CdWlsZEl0ZW1Gb3JtKGl0ZW06IEZpbGVJdGVtLCBmb3JtOiBhbnkpOiB2b2lkIHtcbiAgICBpdGVtLl9vbkJ1aWxkRm9ybShmb3JtKTtcbiAgICB0aGlzLm9uQnVpbGRJdGVtRm9ybShpdGVtLCBmb3JtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25Qcm9ncmVzc0l0ZW0oaXRlbTogRmlsZUl0ZW0sIHByb2dyZXNzOiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgdG90YWwgPSB0aGlzLl9nZXRUb3RhbFByb2dyZXNzKHByb2dyZXNzKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdG90YWw7XG4gICAgaXRlbS5fb25Qcm9ncmVzcyhwcm9ncmVzcyk7XG4gICAgdGhpcy5vblByb2dyZXNzSXRlbShpdGVtLCBwcm9ncmVzcyk7XG4gICAgdGhpcy5vblByb2dyZXNzQWxsKHRvdGFsKTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25TdWNjZXNzSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uU3VjY2VzcyhyZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICB0aGlzLm9uU3VjY2Vzc0l0ZW0oaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX29uQ2FuY2VsSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uQ2FuY2VsKHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICAgIHRoaXMub25DYW5jZWxJdGVtKGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICB9XG59XG4iXX0=