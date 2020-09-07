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
export class FileUploader {
    /**
     * @param {?} options
     */
    constructor(options) {
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
            (item) => item._file),
            formatDataFunctionIsAsync: false
        };
        this.setOptions(options);
        this.response = new EventEmitter();
    }
    /**
     * @param {?} options
     * @return {?}
     */
    setOptions(options) {
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
        for (let i = 0; i < this.queue.length; i++) {
            this.queue[i].url = this.options.url;
        }
    }
    /**
     * @param {?} files
     * @param {?=} options
     * @param {?=} filters
     * @return {?}
     */
    addToQueue(files, options, filters) {
        /** @type {?} */
        let list = [];
        for (let file of files) {
            list.push(file);
        }
        /** @type {?} */
        let arrayOfFilters = this._getFilters(filters);
        /** @type {?} */
        let count = this.queue.length;
        /** @type {?} */
        let addedFileItems = [];
        list.map((/**
         * @param {?} some
         * @return {?}
         */
        (some) => {
            if (!options) {
                options = this.options;
            }
            /** @type {?} */
            let temp = new FileLikeObject(some);
            this._isValidFile(temp, arrayOfFilters, options).then((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                let fileItem = new FileItem(this, some, options);
                addedFileItems.push(fileItem);
                this.queue.push(fileItem);
                this._onAfterAddingFile(fileItem);
            })).catch((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                let filter = arrayOfFilters[this._failFilterIndex];
                this._onWhenAddingFileFailed(temp, filter, options);
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
    }
    /**
     * @param {?} value
     * @return {?}
     */
    removeFromQueue(value) {
        /** @type {?} */
        let index = this.getIndexOfItem(value);
        /** @type {?} */
        let item = this.queue[index];
        if (item.isUploading) {
            item.cancel();
        }
        this.queue.splice(index, 1);
        this.progress = this._getTotalProgress();
    }
    /**
     * @return {?}
     */
    clearQueue() {
        while (this.queue.length) {
            this.queue[0].remove();
        }
        this.progress = 0;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    uploadItem(value) {
        /** @type {?} */
        let index = this.getIndexOfItem(value);
        /** @type {?} */
        let item = this.queue[index];
        /** @type {?} */
        let transport = this.options.isHTML5 ? '_xhrTransport' : '_iframeTransport';
        item._prepareToUploading();
        if (this.isUploading) {
            return;
        }
        this.isUploading = true;
        ((/** @type {?} */ (this)))[transport](item);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    cancelItem(value) {
        /** @type {?} */
        let index = this.getIndexOfItem(value);
        /** @type {?} */
        let item = this.queue[index];
        /** @type {?} */
        let prop = this.options.isHTML5 ? item._xhr : item._form;
        if (item && item.isUploading) {
            prop.abort();
        }
    }
    /**
     * @return {?}
     */
    uploadAll() {
        /** @type {?} */
        let items = this.getNotUploadedItems().filter((/**
         * @param {?} item
         * @return {?}
         */
        (item) => !item.isUploading));
        if (!items.length) {
            return;
        }
        items.map((/**
         * @param {?} item
         * @return {?}
         */
        (item) => item._prepareToUploading()));
        items[0].upload();
    }
    /**
     * @return {?}
     */
    cancelAll() {
        /** @type {?} */
        let items = this.getNotUploadedItems();
        items.map((/**
         * @param {?} item
         * @return {?}
         */
        (item) => item.cancel()));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    isFile(value) {
        return isFile(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    isFileLikeObject(value) {
        return value instanceof FileLikeObject;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    getIndexOfItem(value) {
        return typeof value === 'number' ? value : this.queue.indexOf(value);
    }
    /**
     * @return {?}
     */
    getNotUploadedItems() {
        return this.queue.filter((/**
         * @param {?} item
         * @return {?}
         */
        (item) => !item.isUploaded));
    }
    /**
     * @return {?}
     */
    getReadyItems() {
        return this.queue
            .filter((/**
         * @param {?} item
         * @return {?}
         */
        (item) => (item.isReady && !item.isUploading)))
            .sort((/**
         * @param {?} item1
         * @param {?} item2
         * @return {?}
         */
        (item1, item2) => item1.index - item2.index));
    }
    /**
     * @return {?}
     */
    destroy() {
        return void 0;
    }
    /**
     * @param {?} fileItems
     * @return {?}
     */
    onAfterAddingAll(fileItems) {
        return { fileItems };
    }
    /**
     * @param {?} fileItem
     * @param {?} form
     * @return {?}
     */
    onBuildItemForm(fileItem, form) {
        return { fileItem, form };
    }
    /**
     * @param {?} fileItem
     * @return {?}
     */
    onAfterAddingFile(fileItem) {
        return { fileItem };
    }
    /**
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    onWhenAddingFileFailed(item, filter, options) {
        return { item, filter, options };
    }
    /**
     * @param {?} fileItem
     * @return {?}
     */
    onBeforeUploadItem(fileItem) {
        return { fileItem };
    }
    /**
     * @param {?} fileItem
     * @param {?} progress
     * @return {?}
     */
    onProgressItem(fileItem, progress) {
        return { fileItem, progress };
    }
    /**
     * @param {?} progress
     * @return {?}
     */
    onProgressAll(progress) {
        return { progress };
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    onSuccessItem(item, response, status, headers) {
        return { item, response, status, headers };
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    onErrorItem(item, response, status, headers) {
        return { item, response, status, headers };
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    onCancelItem(item, response, status, headers) {
        return { item, response, status, headers };
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    onCompleteItem(item, response, status, headers) {
        return { item, response, status, headers };
    }
    /**
     * @return {?}
     */
    onCompleteAll() {
        return void 0;
    }
    /**
     * @param {?} item
     * @return {?}
     */
    _mimeTypeFilter(item) {
        return !(this.options.allowedMimeType && this.options.allowedMimeType.indexOf(item.type) === -1);
    }
    /**
     * @param {?} item
     * @return {?}
     */
    _fileSizeFilter(item) {
        return !(this.options.maxFileSize && item.size > this.options.maxFileSize);
    }
    /**
     * @param {?} item
     * @return {?}
     */
    _fileTypeFilter(item) {
        return !(this.options.allowedFileType &&
            this.options.allowedFileType.indexOf(FileType.getMimeClass(item)) === -1);
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    _onErrorItem(item, response, status, headers) {
        item._onError(response, status, headers);
        this.onErrorItem(item, response, status, headers);
    }
    /**
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    _onCompleteItem(item, response, status, headers) {
        item._onComplete(response, status, headers);
        this.onCompleteItem(item, response, status, headers);
        /** @type {?} */
        let nextItem = this.getReadyItems()[0];
        this.isUploading = false;
        if (nextItem) {
            nextItem.upload();
            return;
        }
        this.onCompleteAll();
        this.progress = this._getTotalProgress();
        this._render();
    }
    /**
     * @protected
     * @param {?} parsedHeaders
     * @return {?}
     */
    _headersGetter(parsedHeaders) {
        return (/**
         * @param {?} name
         * @return {?}
         */
        (name) => {
            if (name) {
                return parsedHeaders[name.toLowerCase()] || void 0;
            }
            return parsedHeaders;
        });
    }
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    _xhrTransport(item) {
        /** @type {?} */
        let that = this;
        /** @type {?} */
        let xhr = item._xhr = new XMLHttpRequest();
        /** @type {?} */
        let sendable;
        this._onBeforeUploadItem(item);
        if (typeof item._file.size !== 'number') {
            throw new TypeError('The file specified is no longer valid');
        }
        if (!this.options.disableMultipart) {
            sendable = new FormData();
            this._onBuildItemForm(item, sendable);
            /** @type {?} */
            const appendFile = (/**
             * @return {?}
             */
            () => sendable.append(item.alias, item._file, item.file.name));
            if (!this.options.parametersBeforeFiles) {
                appendFile();
            }
            // For AWS, Additional Parameters must come BEFORE Files
            if (this.options.additionalParameter !== undefined) {
                Object.keys(this.options.additionalParameter).forEach((/**
                 * @param {?} key
                 * @return {?}
                 */
                (key) => {
                    /** @type {?} */
                    let paramVal = this.options.additionalParameter[key];
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
        (event) => {
            /** @type {?} */
            let progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
            this._onProgressItem(item, progress);
        });
        xhr.onload = (/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            let headers = this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            let response = this._transformResponse(xhr.response, headers);
            /** @type {?} */
            let gist = this._isSuccessCode(xhr.status) ? 'Success' : 'Error';
            /** @type {?} */
            let method = '_on' + gist + 'Item';
            ((/** @type {?} */ (this)))[method](item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.onerror = (/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            let headers = this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            let response = this._transformResponse(xhr.response, headers);
            this._onErrorItem(item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.onabort = (/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            let headers = this._parseHeaders(xhr.getAllResponseHeaders());
            /** @type {?} */
            let response = this._transformResponse(xhr.response, headers);
            this._onCancelItem(item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        });
        xhr.open(item.method, item.url, true);
        xhr.withCredentials = item.withCredentials;
        if (this.options.headers) {
            for (let header of this.options.headers) {
                xhr.setRequestHeader(header.name, header.value);
            }
        }
        if (item.headers.length) {
            for (let header of item.headers) {
                xhr.setRequestHeader(header.name, header.value);
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
            (result) => xhr.send(JSON.stringify(result))));
        }
        else {
            xhr.send(sendable);
        }
        this._render();
    }
    /**
     * @protected
     * @param {?=} value
     * @return {?}
     */
    _getTotalProgress(value = 0) {
        if (this.options.removeAfterUpload) {
            return value;
        }
        /** @type {?} */
        let notUploaded = this.getNotUploadedItems().length;
        /** @type {?} */
        let uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
        /** @type {?} */
        let ratio = 100 / this.queue.length;
        /** @type {?} */
        let current = value * ratio / 100;
        return Math.round(uploaded * ratio + current);
    }
    /**
     * @protected
     * @param {?} filters
     * @return {?}
     */
    _getFilters(filters) {
        if (!filters) {
            return this.options.filters;
        }
        if (Array.isArray(filters)) {
            return filters;
        }
        if (typeof filters === 'string') {
            /** @type {?} */
            let names = filters.match(/[^\s,]+/g);
            return this.options.filters
                .filter((/**
             * @param {?} filter
             * @return {?}
             */
            (filter) => names.indexOf(filter.name) !== -1));
        }
        return this.options.filters;
    }
    /**
     * @protected
     * @return {?}
     */
    _render() {
        return void 0;
    }
    /**
     * @protected
     * @return {?}
     */
    _queueLimitFilter() {
        return this.options.queueLimit === undefined || this.queue.length < this.options.queueLimit;
    }
    /**
     * @protected
     * @param {?} file
     * @param {?} filters
     * @param {?} options
     * @return {?}
     */
    _isValidFile(file, filters, options) {
        this._failFilterIndex = -1;
        return Promise.all(filters.map((/**
         * @param {?} filter
         * @return {?}
         */
        (filter) => {
            /** @type {?} */
            const isValid = filter.fn.call(this, file, options);
            return Promise.resolve(isValid);
        }))).then((/**
         * @param {?} values
         * @return {?}
         */
        (values) => {
            /** @type {?} */
            const isValid = values.every((/**
             * @param {?} value
             * @return {?}
             */
            (value) => {
                this._failFilterIndex++;
                return value;
            }));
            return isValid
                ? Promise.resolve(isValid)
                : Promise.reject(isValid);
        }));
    }
    /**
     * @protected
     * @param {?} status
     * @return {?}
     */
    _isSuccessCode(status) {
        return (status >= 200 && status < 300) || status === 304;
    }
    /**
     * @protected
     * @param {?} response
     * @param {?} headers
     * @return {?}
     */
    _transformResponse(response, headers) {
        return response;
    }
    /**
     * @protected
     * @param {?} headers
     * @return {?}
     */
    _parseHeaders(headers) {
        /** @type {?} */
        let parsed = {};
        /** @type {?} */
        let key;
        /** @type {?} */
        let val;
        /** @type {?} */
        let i;
        if (!headers) {
            return parsed;
        }
        headers.split('\n').map((/**
         * @param {?} line
         * @return {?}
         */
        (line) => {
            i = line.indexOf(':');
            key = line.slice(0, i).trim().toLowerCase();
            val = line.slice(i + 1).trim();
            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        }));
        return parsed;
    }
    /**
     * @protected
     * @param {?} item
     * @param {?} filter
     * @param {?} options
     * @return {?}
     */
    _onWhenAddingFileFailed(item, filter, options) {
        this.onWhenAddingFileFailed(item, filter, options);
    }
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    _onAfterAddingFile(item) {
        this.onAfterAddingFile(item);
    }
    /**
     * @protected
     * @param {?} items
     * @return {?}
     */
    _onAfterAddingAll(items) {
        this.onAfterAddingAll(items);
    }
    /**
     * @protected
     * @param {?} item
     * @return {?}
     */
    _onBeforeUploadItem(item) {
        item._onBeforeUpload();
        this.onBeforeUploadItem(item);
    }
    /**
     * @protected
     * @param {?} item
     * @param {?} form
     * @return {?}
     */
    _onBuildItemForm(item, form) {
        item._onBuildForm(form);
        this.onBuildItemForm(item, form);
    }
    /**
     * @protected
     * @param {?} item
     * @param {?} progress
     * @return {?}
     */
    _onProgressItem(item, progress) {
        /** @type {?} */
        let total = this._getTotalProgress(progress);
        this.progress = total;
        item._onProgress(progress);
        this.onProgressItem(item, progress);
        this.onProgressAll(total);
        this._render();
    }
    /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    _onSuccessItem(item, response, status, headers) {
        item._onSuccess(response, status, headers);
        this.onSuccessItem(item, response, status, headers);
    }
    /**
     * @protected
     * @param {?} item
     * @param {?} response
     * @param {?} status
     * @param {?} headers
     * @return {?}
     */
    _onCancelItem(item, response, status, headers) {
        item._onCancel(response, status, headers);
        this.onCancelItem(item, response, status, headers);
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWRlci5jbGFzcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nMi1maWxlLXVwbG9hZC8iLCJzb3VyY2VzIjpbImZpbGUtdXBsb2FkL2ZpbGUtdXBsb2FkZXIuY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7Ozs7O0FBRTdDLFNBQVMsTUFBTSxDQUFDLEtBQVU7SUFDeEIsT0FBTyxDQUFDLElBQUksSUFBSSxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQzs7OztBQUVELDZCQUdDOzs7SUFGQyx1QkFBYTs7SUFDYix3QkFBYzs7Ozs7QUFVaEIseUNBb0JDOzs7SUFuQkMsOENBQTJCOztJQUMzQiw4Q0FBMkI7O0lBQzNCLHlDQUFxQjs7SUFDckIsc0NBQWtCOztJQUNsQixzQ0FBMkI7O0lBQzNCLHNDQUFvQjs7SUFDcEIscUNBQWdCOztJQUNoQix3Q0FBbUI7O0lBQ25CLDBDQUFxQjs7SUFDckIseUNBQW9COztJQUNwQixnREFBNEI7O0lBQzVCLGtDQUFhOztJQUNiLCtDQUEyQjs7SUFDM0Isd0NBQW1COztJQUNuQiw4Q0FBeUI7O0lBQ3pCLGtEQUErQzs7SUFDL0Msb0RBQWdDOztJQUNoQyxpREFBOEI7O0lBQzlCLHdEQUFvQzs7QUFHdEMsTUFBTSxPQUFPLFlBQVk7Ozs7SUF1QnZCLFlBQW1CLE9BQTRCO1FBcEJ4QyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixVQUFLLEdBQWUsRUFBRSxDQUFDO1FBQ3ZCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUt2QixZQUFP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QUFDO1FBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pCLENBQUM7Ozs7Ozs7OztJQUVTLGNBQWMsQ0FBQyxJQUFjLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsT0FBOEI7UUFDdkcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsQ0FBQzs7Ozs7Ozs7O0lBRVMsYUFBYSxDQUFDLElBQWMsRUFBRSxRQUFnQixFQUFFLE1BQWMsRUFBRSxPQUE4QjtRQUN0RyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0Y7OztJQWxkQyxpQ0FBeUI7O0lBQ3pCLG1DQUFvQzs7SUFDcEMsNkJBQThCOztJQUM5QixnQ0FBNEI7O0lBQzVCLGtDQUE4Qjs7SUFDOUIsa0NBQXVCOztJQUN2Qix1Q0FBK0I7O0lBQy9CLGdDQUFtQzs7SUFFbkMsK0JBUUU7Ozs7O0lBRUYsd0NBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWxlTGlrZU9iamVjdCB9IGZyb20gJy4vZmlsZS1saWtlLW9iamVjdC5jbGFzcyc7XG5pbXBvcnQgeyBGaWxlSXRlbSB9IGZyb20gJy4vZmlsZS1pdGVtLmNsYXNzJztcbmltcG9ydCB7IEZpbGVUeXBlIH0gZnJvbSAnLi9maWxlLXR5cGUuY2xhc3MnO1xuXG5mdW5jdGlvbiBpc0ZpbGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKEZpbGUgJiYgdmFsdWUgaW5zdGFuY2VvZiBGaWxlKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFkZXJzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQYXJzZWRSZXNwb25zZUhlYWRlcnMgPSB7IFsgaGVhZGVyRmllbGROYW1lOiBzdHJpbmcgXTogc3RyaW5nIH07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIGZuOiAoaXRlbT86IEZpbGVMaWtlT2JqZWN0LCBvcHRpb25zPzogRmlsZVVwbG9hZGVyT3B0aW9ucykgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj5cbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVVwbG9hZGVyT3B0aW9ucyB7XG4gIGFsbG93ZWRNaW1lVHlwZT86IHN0cmluZ1tdO1xuICBhbGxvd2VkRmlsZVR5cGU/OiBzdHJpbmdbXTtcbiAgYXV0b1VwbG9hZD86IGJvb2xlYW47XG4gIGlzSFRNTDU/OiBib29sZWFuO1xuICBmaWx0ZXJzPzogRmlsdGVyRnVuY3Rpb25bXTtcbiAgaGVhZGVycz86IEhlYWRlcnNbXTtcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBhdXRoVG9rZW4/OiBzdHJpbmc7XG4gIG1heEZpbGVTaXplPzogbnVtYmVyO1xuICBxdWV1ZUxpbWl0PzogbnVtYmVyO1xuICByZW1vdmVBZnRlclVwbG9hZD86IGJvb2xlYW47XG4gIHVybD86IHN0cmluZztcbiAgZGlzYWJsZU11bHRpcGFydD86IGJvb2xlYW47XG4gIGl0ZW1BbGlhcz86IHN0cmluZztcbiAgYXV0aFRva2VuSGVhZGVyPzogc3RyaW5nO1xuICBhZGRpdGlvbmFsUGFyYW1ldGVyPzogeyBbIGtleTogc3RyaW5nIF06IGFueSB9O1xuICBwYXJhbWV0ZXJzQmVmb3JlRmlsZXM/OiBib29sZWFuO1xuICBmb3JtYXREYXRhRnVuY3Rpb24/OiBGdW5jdGlvbjtcbiAgZm9ybWF0RGF0YUZ1bmN0aW9uSXNBc3luYz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBGaWxlVXBsb2FkZXIge1xuXG4gIHB1YmxpYyBhdXRoVG9rZW46IHN0cmluZztcbiAgcHVibGljIGlzVXBsb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBxdWV1ZTogRmlsZUl0ZW1bXSA9IFtdO1xuICBwdWJsaWMgcHJvZ3Jlc3M6IG51bWJlciA9IDA7XG4gIHB1YmxpYyBfbmV4dEluZGV4OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgYXV0b1VwbG9hZDogYW55O1xuICBwdWJsaWMgYXV0aFRva2VuSGVhZGVyOiBzdHJpbmc7XG4gIHB1YmxpYyByZXNwb25zZTogRXZlbnRFbWl0dGVyPGFueT47XG5cbiAgcHVibGljIG9wdGlvbnM6IEZpbGVVcGxvYWRlck9wdGlvbnMgPSB7XG4gICAgYXV0b1VwbG9hZDogZmFsc2UsXG4gICAgaXNIVE1MNTogdHJ1ZSxcbiAgICBmaWx0ZXJzOiBbXSxcbiAgICByZW1vdmVBZnRlclVwbG9hZDogZmFsc2UsXG4gICAgZGlzYWJsZU11bHRpcGFydDogZmFsc2UsXG4gICAgZm9ybWF0RGF0YUZ1bmN0aW9uOiAoaXRlbTogRmlsZUl0ZW0pID0+IGl0ZW0uX2ZpbGUsXG4gICAgZm9ybWF0RGF0YUZ1bmN0aW9uSXNBc3luYzogZmFsc2VcbiAgfTtcblxuICBwcm90ZWN0ZWQgX2ZhaWxGaWx0ZXJJbmRleDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBGaWxlVXBsb2FkZXJPcHRpb25zKSB7XG4gICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMucmVzcG9uc2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnM6IEZpbGVVcGxvYWRlck9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmF1dGhUb2tlbiA9IHRoaXMub3B0aW9ucy5hdXRoVG9rZW47XG4gICAgdGhpcy5hdXRoVG9rZW5IZWFkZXIgPSB0aGlzLm9wdGlvbnMuYXV0aFRva2VuSGVhZGVyIHx8ICdBdXRob3JpemF0aW9uJztcbiAgICB0aGlzLmF1dG9VcGxvYWQgPSB0aGlzLm9wdGlvbnMuYXV0b1VwbG9hZDtcbiAgICB0aGlzLm9wdGlvbnMuZmlsdGVycy51bnNoaWZ0KHsgbmFtZTogJ3F1ZXVlTGltaXQnLCBmbjogdGhpcy5fcXVldWVMaW1pdEZpbHRlciB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnZmlsZVNpemUnLCBmbjogdGhpcy5fZmlsZVNpemVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnZmlsZVR5cGUnLCBmbjogdGhpcy5fZmlsZVR5cGVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd2VkTWltZVR5cGUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5maWx0ZXJzLnVuc2hpZnQoeyBuYW1lOiAnbWltZVR5cGUnLCBmbjogdGhpcy5fbWltZVR5cGVGaWx0ZXIgfSk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnF1ZXVlWyBpIF0udXJsID0gdGhpcy5vcHRpb25zLnVybDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWRkVG9RdWV1ZShmaWxlczogRmlsZVtdLCBvcHRpb25zPzogRmlsZVVwbG9hZGVyT3B0aW9ucywgZmlsdGVycz86IEZpbHRlckZ1bmN0aW9uW10gfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgbGlzdDogRmlsZVtdID0gW107XG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGlzdC5wdXNoKGZpbGUpO1xuICAgIH1cbiAgICBsZXQgYXJyYXlPZkZpbHRlcnMgPSB0aGlzLl9nZXRGaWx0ZXJzKGZpbHRlcnMpO1xuICAgIGxldCBjb3VudCA9IHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCBhZGRlZEZpbGVJdGVtczogRmlsZUl0ZW1bXSA9IFtdO1xuICAgIGxpc3QubWFwKChzb21lOiBGaWxlKSA9PiB7XG4gICAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIH1cblxuICAgICAgbGV0IHRlbXAgPSBuZXcgRmlsZUxpa2VPYmplY3Qoc29tZSk7XG5cbiAgICAgIHRoaXMuX2lzVmFsaWRGaWxlKHRlbXAsIGFycmF5T2ZGaWx0ZXJzLCBvcHRpb25zKS50aGVuKCgpID0+IHtcbiAgICAgICAgbGV0IGZpbGVJdGVtID0gbmV3IEZpbGVJdGVtKHRoaXMsIHNvbWUsIG9wdGlvbnMpO1xuICAgICAgICBhZGRlZEZpbGVJdGVtcy5wdXNoKGZpbGVJdGVtKTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGZpbGVJdGVtKTtcbiAgICAgICAgdGhpcy5fb25BZnRlckFkZGluZ0ZpbGUoZmlsZUl0ZW0pO1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICBsZXQgZmlsdGVyID0gYXJyYXlPZkZpbHRlcnNbdGhpcy5fZmFpbEZpbHRlckluZGV4XTtcbiAgICAgICAgdGhpcy5fb25XaGVuQWRkaW5nRmlsZUZhaWxlZCh0ZW1wLCBmaWx0ZXIsIG9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoICE9PSBjb3VudCkge1xuICAgICAgdGhpcy5fb25BZnRlckFkZGluZ0FsbChhZGRlZEZpbGVJdGVtcyk7XG4gICAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICAgIH1cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9VcGxvYWQpIHtcbiAgICAgIHRoaXMudXBsb2FkQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbW92ZUZyb21RdWV1ZSh2YWx1ZTogRmlsZUl0ZW0pOiB2b2lkIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLmdldEluZGV4T2ZJdGVtKHZhbHVlKTtcbiAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbIGluZGV4IF07XG4gICAgaWYgKGl0ZW0uaXNVcGxvYWRpbmcpIHtcbiAgICAgIGl0ZW0uY2FuY2VsKCk7XG4gICAgfVxuICAgIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICB9XG5cbiAgcHVibGljIGNsZWFyUXVldWUoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLnF1ZXVlWyAwIF0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICB9XG5cbiAgcHVibGljIHVwbG9hZEl0ZW0odmFsdWU6IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5nZXRJbmRleE9mSXRlbSh2YWx1ZSk7XG4gICAgbGV0IGl0ZW0gPSB0aGlzLnF1ZXVlWyBpbmRleCBdO1xuICAgIGxldCB0cmFuc3BvcnQgPSB0aGlzLm9wdGlvbnMuaXNIVE1MNSA/ICdfeGhyVHJhbnNwb3J0JyA6ICdfaWZyYW1lVHJhbnNwb3J0JztcbiAgICBpdGVtLl9wcmVwYXJlVG9VcGxvYWRpbmcoKTtcbiAgICBpZiAodGhpcy5pc1VwbG9hZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmlzVXBsb2FkaW5nID0gdHJ1ZTtcbiAgICAodGhpcyBhcyBhbnkpWyB0cmFuc3BvcnQgXShpdGVtKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxJdGVtKHZhbHVlOiBGaWxlSXRlbSk6IHZvaWQge1xuICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SW5kZXhPZkl0ZW0odmFsdWUpO1xuICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVsgaW5kZXggXTtcbiAgICBsZXQgcHJvcCA9IHRoaXMub3B0aW9ucy5pc0hUTUw1ID8gaXRlbS5feGhyIDogaXRlbS5fZm9ybTtcbiAgICBpZiAoaXRlbSAmJiBpdGVtLmlzVXBsb2FkaW5nKSB7XG4gICAgICBwcm9wLmFib3J0KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwbG9hZEFsbCgpOiB2b2lkIHtcbiAgICBsZXQgaXRlbXMgPSB0aGlzLmdldE5vdFVwbG9hZGVkSXRlbXMoKS5maWx0ZXIoKGl0ZW06IEZpbGVJdGVtKSA9PiAhaXRlbS5pc1VwbG9hZGluZyk7XG4gICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbXMubWFwKChpdGVtOiBGaWxlSXRlbSkgPT4gaXRlbS5fcHJlcGFyZVRvVXBsb2FkaW5nKCkpO1xuICAgIGl0ZW1zWyAwIF0udXBsb2FkKCk7XG4gIH1cblxuICBwdWJsaWMgY2FuY2VsQWxsKCk6IHZvaWQge1xuICAgIGxldCBpdGVtcyA9IHRoaXMuZ2V0Tm90VXBsb2FkZWRJdGVtcygpO1xuICAgIGl0ZW1zLm1hcCgoaXRlbTogRmlsZUl0ZW0pID0+IGl0ZW0uY2FuY2VsKCkpO1xuICB9XG5cbiAgcHVibGljIGlzRmlsZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmlsZSh2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgaXNGaWxlTGlrZU9iamVjdCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRmlsZUxpa2VPYmplY3Q7XG4gIH1cblxuICBwdWJsaWMgZ2V0SW5kZXhPZkl0ZW0odmFsdWU6IGFueSk6IG51bWJlciB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IHRoaXMucXVldWUuaW5kZXhPZih2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Tm90VXBsb2FkZWRJdGVtcygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUuZmlsdGVyKChpdGVtOiBGaWxlSXRlbSkgPT4gIWl0ZW0uaXNVcGxvYWRlZCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVhZHlJdGVtcygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVldWVcbiAgICAgIC5maWx0ZXIoKGl0ZW06IEZpbGVJdGVtKSA9PiAoaXRlbS5pc1JlYWR5ICYmICFpdGVtLmlzVXBsb2FkaW5nKSlcbiAgICAgIC5zb3J0KChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBpdGVtMS5pbmRleCAtIGl0ZW0yLmluZGV4KTtcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwdWJsaWMgb25BZnRlckFkZGluZ0FsbChmaWxlSXRlbXM6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW1zIH07XG4gIH1cblxuICBwdWJsaWMgb25CdWlsZEl0ZW1Gb3JtKGZpbGVJdGVtOiBGaWxlSXRlbSwgZm9ybTogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBmaWxlSXRlbSwgZm9ybSB9O1xuICB9XG5cbiAgcHVibGljIG9uQWZ0ZXJBZGRpbmdGaWxlKGZpbGVJdGVtOiBGaWxlSXRlbSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW0gfTtcbiAgfVxuXG4gIHB1YmxpYyBvbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW06IEZpbGVMaWtlT2JqZWN0LCBmaWx0ZXI6IGFueSwgb3B0aW9uczogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBpdGVtLCBmaWx0ZXIsIG9wdGlvbnMgfTtcbiAgfVxuXG4gIHB1YmxpYyBvbkJlZm9yZVVwbG9hZEl0ZW0oZmlsZUl0ZW06IEZpbGVJdGVtKTogYW55IHtcbiAgICByZXR1cm4geyBmaWxlSXRlbSB9O1xuICB9XG5cbiAgcHVibGljIG9uUHJvZ3Jlc3NJdGVtKGZpbGVJdGVtOiBGaWxlSXRlbSwgcHJvZ3Jlc3M6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHsgZmlsZUl0ZW0sIHByb2dyZXNzIH07XG4gIH1cblxuICBwdWJsaWMgb25Qcm9ncmVzc0FsbChwcm9ncmVzczogYW55KTogYW55IHtcbiAgICByZXR1cm4geyBwcm9ncmVzcyB9O1xuICB9XG5cbiAgcHVibGljIG9uU3VjY2Vzc0l0ZW0oaXRlbTogRmlsZUl0ZW0sIHJlc3BvbnNlOiBzdHJpbmcsIHN0YXR1czogbnVtYmVyLCBoZWFkZXJzOiBQYXJzZWRSZXNwb25zZUhlYWRlcnMpOiBhbnkge1xuICAgIHJldHVybiB7IGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMgfTtcbiAgfVxuXG4gIHB1YmxpYyBvbkVycm9ySXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIHsgaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyB9O1xuICB9XG5cbiAgcHVibGljIG9uQ2FuY2VsSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIHsgaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyB9O1xuICB9XG5cbiAgcHVibGljIG9uQ29tcGxldGVJdGVtKGl0ZW06IEZpbGVJdGVtLCByZXNwb25zZTogc3RyaW5nLCBzdGF0dXM6IG51bWJlciwgaGVhZGVyczogUGFyc2VkUmVzcG9uc2VIZWFkZXJzKTogYW55IHtcbiAgICByZXR1cm4geyBpdGVtLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzIH07XG4gIH1cblxuICBwdWJsaWMgb25Db21wbGV0ZUFsbCgpOiBhbnkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwdWJsaWMgX21pbWVUeXBlRmlsdGVyKGl0ZW06IEZpbGVMaWtlT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEodGhpcy5vcHRpb25zLmFsbG93ZWRNaW1lVHlwZSAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZE1pbWVUeXBlLmluZGV4T2YoaXRlbS50eXBlKSA9PT0gLTEpO1xuICB9XG5cbiAgcHVibGljIF9maWxlU2l6ZUZpbHRlcihpdGVtOiBGaWxlTGlrZU9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhKHRoaXMub3B0aW9ucy5tYXhGaWxlU2l6ZSAmJiBpdGVtLnNpemUgPiB0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUpO1xuICB9XG5cbiAgcHVibGljIF9maWxlVHlwZUZpbHRlcihpdGVtOiBGaWxlTGlrZU9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhKHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUgJiZcbiAgICAgIHRoaXMub3B0aW9ucy5hbGxvd2VkRmlsZVR5cGUuaW5kZXhPZihGaWxlVHlwZS5nZXRNaW1lQ2xhc3MoaXRlbSkpID09PSAtMSk7XG4gIH1cblxuICBwdWJsaWMgX29uRXJyb3JJdGVtKGl0ZW06IEZpbGVJdGVtLCByZXNwb25zZTogc3RyaW5nLCBzdGF0dXM6IG51bWJlciwgaGVhZGVyczogUGFyc2VkUmVzcG9uc2VIZWFkZXJzKTogdm9pZCB7XG4gICAgaXRlbS5fb25FcnJvcihyZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICB0aGlzLm9uRXJyb3JJdGVtKGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICB9XG5cbiAgcHVibGljIF9vbkNvbXBsZXRlSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uQ29tcGxldGUocmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyk7XG4gICAgdGhpcy5vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLmdldFJlYWR5SXRlbXMoKVsgMCBdO1xuICAgIHRoaXMuaXNVcGxvYWRpbmcgPSBmYWxzZTtcbiAgICBpZiAobmV4dEl0ZW0pIHtcbiAgICAgIG5leHRJdGVtLnVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9uQ29tcGxldGVBbGwoKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5fZ2V0VG90YWxQcm9ncmVzcygpO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9oZWFkZXJzR2V0dGVyKHBhcnNlZEhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IGFueSB7XG4gICAgcmV0dXJuIChuYW1lOiBhbnkpOiBhbnkgPT4ge1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZEhlYWRlcnNbIG5hbWUudG9Mb3dlckNhc2UoKSBdIHx8IHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJzZWRIZWFkZXJzO1xuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgX3hoclRyYW5zcG9ydChpdGVtOiBGaWxlSXRlbSk6IGFueSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCB4aHIgPSBpdGVtLl94aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBsZXQgc2VuZGFibGU6IGFueTtcbiAgICB0aGlzLl9vbkJlZm9yZVVwbG9hZEl0ZW0oaXRlbSk7XG5cbiAgICBpZiAodHlwZW9mIGl0ZW0uX2ZpbGUuc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBmaWxlIHNwZWNpZmllZCBpcyBubyBsb25nZXIgdmFsaWQnKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZU11bHRpcGFydCkge1xuICAgICAgc2VuZGFibGUgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIHRoaXMuX29uQnVpbGRJdGVtRm9ybShpdGVtLCBzZW5kYWJsZSk7XG5cbiAgICAgIGNvbnN0IGFwcGVuZEZpbGUgPSAoKSA9PiBzZW5kYWJsZS5hcHBlbmQoaXRlbS5hbGlhcywgaXRlbS5fZmlsZSwgaXRlbS5maWxlLm5hbWUpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyYW1ldGVyc0JlZm9yZUZpbGVzKSB7XG4gICAgICAgIGFwcGVuZEZpbGUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIEFXUywgQWRkaXRpb25hbCBQYXJhbWV0ZXJzIG11c3QgY29tZSBCRUZPUkUgRmlsZXNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWRkaXRpb25hbFBhcmFtZXRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMub3B0aW9ucy5hZGRpdGlvbmFsUGFyYW1ldGVyKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGxldCBwYXJhbVZhbCA9IHRoaXMub3B0aW9ucy5hZGRpdGlvbmFsUGFyYW1ldGVyWyBrZXkgXTtcbiAgICAgICAgICAvLyBBbGxvdyBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciB0byBpbmNsdWRlIHRoZSBmaWxlbmFtZVxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1WYWwgPT09ICdzdHJpbmcnICYmIHBhcmFtVmFsLmluZGV4T2YoJ3t7ZmlsZV9uYW1lfX0nKSA+PSAwKSB7XG4gICAgICAgICAgICBwYXJhbVZhbCA9IHBhcmFtVmFsLnJlcGxhY2UoJ3t7ZmlsZV9uYW1lfX0nLCBpdGVtLmZpbGUubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbmRhYmxlLmFwcGVuZChrZXksIHBhcmFtVmFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyYW1ldGVyc0JlZm9yZUZpbGVzKSB7XG4gICAgICAgIGFwcGVuZEZpbGUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VuZGFibGUgPSB0aGlzLm9wdGlvbnMuZm9ybWF0RGF0YUZ1bmN0aW9uKGl0ZW0pO1xuICAgIH1cblxuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChldmVudDogYW55KSA9PiB7XG4gICAgICBsZXQgcHJvZ3Jlc3MgPSBNYXRoLnJvdW5kKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUgPyBldmVudC5sb2FkZWQgKiAxMDAgLyBldmVudC50b3RhbCA6IDApO1xuICAgICAgdGhpcy5fb25Qcm9ncmVzc0l0ZW0oaXRlbSwgcHJvZ3Jlc3MpO1xuICAgIH07XG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gICAgICBsZXQgcmVzcG9uc2UgPSB0aGlzLl90cmFuc2Zvcm1SZXNwb25zZSh4aHIucmVzcG9uc2UsIGhlYWRlcnMpO1xuICAgICAgbGV0IGdpc3QgPSB0aGlzLl9pc1N1Y2Nlc3NDb2RlKHhoci5zdGF0dXMpID8gJ1N1Y2Nlc3MnIDogJ0Vycm9yJztcbiAgICAgIGxldCBtZXRob2QgPSAnX29uJyArIGdpc3QgKyAnSXRlbSc7XG4gICAgICAodGhpcyBhcyBhbnkpWyBtZXRob2QgXShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgICB0aGlzLl9vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgfTtcbiAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gICAgICBsZXQgcmVzcG9uc2UgPSB0aGlzLl90cmFuc2Zvcm1SZXNwb25zZSh4aHIucmVzcG9uc2UsIGhlYWRlcnMpO1xuICAgICAgdGhpcy5fb25FcnJvckl0ZW0oaXRlbSwgcmVzcG9uc2UsIHhoci5zdGF0dXMsIGhlYWRlcnMpO1xuICAgICAgdGhpcy5fb25Db21wbGV0ZUl0ZW0oaXRlbSwgcmVzcG9uc2UsIHhoci5zdGF0dXMsIGhlYWRlcnMpO1xuICAgIH07XG4gICAgeGhyLm9uYWJvcnQgPSAoKSA9PiB7XG4gICAgICBsZXQgaGVhZGVycyA9IHRoaXMuX3BhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAgICAgbGV0IHJlc3BvbnNlID0gdGhpcy5fdHJhbnNmb3JtUmVzcG9uc2UoeGhyLnJlc3BvbnNlLCBoZWFkZXJzKTtcbiAgICAgIHRoaXMuX29uQ2FuY2VsSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgICB0aGlzLl9vbkNvbXBsZXRlSXRlbShpdGVtLCByZXNwb25zZSwgeGhyLnN0YXR1cywgaGVhZGVycyk7XG4gICAgfTtcbiAgICB4aHIub3BlbihpdGVtLm1ldGhvZCwgaXRlbS51cmwsIHRydWUpO1xuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBpdGVtLndpdGhDcmVkZW50aWFscztcbiAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgIGZvciAobGV0IGhlYWRlciBvZiB0aGlzLm9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIubmFtZSwgaGVhZGVyLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGl0ZW0uaGVhZGVycy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGhlYWRlciBvZiBpdGVtLmhlYWRlcnMpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLm5hbWUsIGhlYWRlci52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmF1dGhUb2tlbikge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIodGhpcy5hdXRoVG9rZW5IZWFkZXIsIHRoaXMuYXV0aFRva2VuKTtcbiAgICB9XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgIHRoYXQucmVzcG9uc2UuZW1pdCh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmZvcm1hdERhdGFGdW5jdGlvbklzQXN5bmMpIHtcbiAgICAgIHNlbmRhYmxlLnRoZW4oXG4gICAgICAgIChyZXN1bHQ6IGFueSkgPT4geGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5zZW5kKHNlbmRhYmxlKTtcbiAgICB9XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldFRvdGFsUHJvZ3Jlc3ModmFsdWU6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3ZlQWZ0ZXJVcGxvYWQpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgbGV0IG5vdFVwbG9hZGVkID0gdGhpcy5nZXROb3RVcGxvYWRlZEl0ZW1zKCkubGVuZ3RoO1xuICAgIGxldCB1cGxvYWRlZCA9IG5vdFVwbG9hZGVkID8gdGhpcy5xdWV1ZS5sZW5ndGggLSBub3RVcGxvYWRlZCA6IHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCByYXRpbyA9IDEwMCAvIHRoaXMucXVldWUubGVuZ3RoO1xuICAgIGxldCBjdXJyZW50ID0gdmFsdWUgKiByYXRpbyAvIDEwMDtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh1cGxvYWRlZCAqIHJhdGlvICsgY3VycmVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldEZpbHRlcnMoZmlsdGVyczogRmlsdGVyRnVuY3Rpb25bXSB8IHN0cmluZyk6IEZpbHRlckZ1bmN0aW9uW10ge1xuICAgIGlmICghZmlsdGVycykge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXJzO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmaWx0ZXJzKSkge1xuICAgICAgcmV0dXJuIGZpbHRlcnM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZmlsdGVycyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBuYW1lcyA9IGZpbHRlcnMubWF0Y2goL1teXFxzLF0rL2cpO1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXJzXG4gICAgICAgIC5maWx0ZXIoKGZpbHRlcjogYW55KSA9PiBuYW1lcy5pbmRleE9mKGZpbHRlci5uYW1lKSAhPT0gLTEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZpbHRlcnM7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3JlbmRlcigpOiBhbnkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3F1ZXVlTGltaXRGaWx0ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5xdWV1ZUxpbWl0ID09PSB1bmRlZmluZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGggPCB0aGlzLm9wdGlvbnMucXVldWVMaW1pdDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfaXNWYWxpZEZpbGUoZmlsZTpGaWxlTGlrZU9iamVjdCwgZmlsdGVyczpGaWx0ZXJGdW5jdGlvbltdLCBvcHRpb25zOkZpbGVVcGxvYWRlck9wdGlvbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLl9mYWlsRmlsdGVySW5kZXggPSAtMTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIGZpbHRlcnMubWFwKChmaWx0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IGZpbHRlci5mbi5jYWxsKHRoaXMsIGZpbGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaXNWYWxpZCk7XG4gICAgICB9KVxuICAgICkudGhlbigodmFsdWVzKSA9PiB7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gdmFsdWVzLmV2ZXJ5KCh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLl9mYWlsRmlsdGVySW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBpc1ZhbGlkXG4gICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaXNWYWxpZClcbiAgICAgICAgICA6IFByb21pc2UucmVqZWN0KGlzVmFsaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9pc1N1Y2Nlc3NDb2RlKHN0YXR1czogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCkgfHwgc3RhdHVzID09PSAzMDQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3RyYW5zZm9ybVJlc3BvbnNlKHJlc3BvbnNlOiBzdHJpbmcsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9wYXJzZUhlYWRlcnMoaGVhZGVyczogc3RyaW5nKTogUGFyc2VkUmVzcG9uc2VIZWFkZXJzIHtcbiAgICBsZXQgcGFyc2VkOiBhbnkgPSB7fTtcbiAgICBsZXQga2V5OiBhbnk7XG4gICAgbGV0IHZhbDogYW55O1xuICAgIGxldCBpOiBhbnk7XG4gICAgaWYgKCFoZWFkZXJzKSB7XG4gICAgICByZXR1cm4gcGFyc2VkO1xuICAgIH1cbiAgICBoZWFkZXJzLnNwbGl0KCdcXG4nKS5tYXAoKGxpbmU6IGFueSkgPT4ge1xuICAgICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgICAga2V5ID0gbGluZS5zbGljZSgwLCBpKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhbCA9IGxpbmUuc2xpY2UoaSArIDEpLnRyaW0oKTtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgcGFyc2VkWyBrZXkgXSA9IHBhcnNlZFsga2V5IF0gPyBwYXJzZWRbIGtleSBdICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcGFyc2VkO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9vbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW06IEZpbGVMaWtlT2JqZWN0LCBmaWx0ZXI6IGFueSwgb3B0aW9uczogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vbldoZW5BZGRpbmdGaWxlRmFpbGVkKGl0ZW0sIGZpbHRlciwgb3B0aW9ucyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX29uQWZ0ZXJBZGRpbmdGaWxlKGl0ZW06IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgdGhpcy5vbkFmdGVyQWRkaW5nRmlsZShpdGVtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25BZnRlckFkZGluZ0FsbChpdGVtczogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vbkFmdGVyQWRkaW5nQWxsKGl0ZW1zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25CZWZvcmVVcGxvYWRJdGVtKGl0ZW06IEZpbGVJdGVtKTogdm9pZCB7XG4gICAgaXRlbS5fb25CZWZvcmVVcGxvYWQoKTtcbiAgICB0aGlzLm9uQmVmb3JlVXBsb2FkSXRlbShpdGVtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25CdWlsZEl0ZW1Gb3JtKGl0ZW06IEZpbGVJdGVtLCBmb3JtOiBhbnkpOiB2b2lkIHtcbiAgICBpdGVtLl9vbkJ1aWxkRm9ybShmb3JtKTtcbiAgICB0aGlzLm9uQnVpbGRJdGVtRm9ybShpdGVtLCBmb3JtKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25Qcm9ncmVzc0l0ZW0oaXRlbTogRmlsZUl0ZW0sIHByb2dyZXNzOiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgdG90YWwgPSB0aGlzLl9nZXRUb3RhbFByb2dyZXNzKHByb2dyZXNzKTtcbiAgICB0aGlzLnByb2dyZXNzID0gdG90YWw7XG4gICAgaXRlbS5fb25Qcm9ncmVzcyhwcm9ncmVzcyk7XG4gICAgdGhpcy5vblByb2dyZXNzSXRlbShpdGVtLCBwcm9ncmVzcyk7XG4gICAgdGhpcy5vblByb2dyZXNzQWxsKHRvdGFsKTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfb25TdWNjZXNzSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uU3VjY2VzcyhyZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICB0aGlzLm9uU3VjY2Vzc0l0ZW0oaXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX29uQ2FuY2VsSXRlbShpdGVtOiBGaWxlSXRlbSwgcmVzcG9uc2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIGhlYWRlcnM6IFBhcnNlZFJlc3BvbnNlSGVhZGVycyk6IHZvaWQge1xuICAgIGl0ZW0uX29uQ2FuY2VsKHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICAgIHRoaXMub25DYW5jZWxJdGVtKGl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpO1xuICB9XG59XG4iXX0=