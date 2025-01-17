/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

"use strict";

const util = require("util");
const Classifier = require("./classifier");
const ApparatusLogisticRegressionWorkersClassifier =
  require("apparatus").LogisticRegressionWorkersClassifier;

const LogisticRegressionWorkersClassifier = function (numWorkers, stemmer) {
  this.numWorkers = numWorkers;
  this.onProgress = (current, total) =>
    this.events.emit("processed", current, total);
  Classifier.call(
    this,
    new ApparatusLogisticRegressionWorkersClassifier(
      this.numWorkers,
      this.onProgress
    ),
    stemmer
  );
};

util.inherits(LogisticRegressionWorkersClassifier, Classifier);

function restore(classifier, stemmer) {
  classifier = Classifier.restore(classifier, stemmer);
  // Using ___proto__ is deprecated
  // classifier.__proto__ = LogisticRegressionClassifier.prototype
  Object.setPrototypeOf(
    classifier,
    LogisticRegressionWorkersClassifier.prototype
  );
  classifier.classifier = ApparatusLogisticRegressionWorkersClassifier.restore(
    classifier.classifier
  );

  return classifier;
}

function load(filename, stemmer, callback) {
  Classifier.load(filename, function (err, classifier) {
    if (err) {
      callback(err);
    } else {
      callback(err, restore(classifier, stemmer));
    }
  });
}

async function train() {
  // we need to reset the traning state because logistic regression
  // needs its matricies to have their widths synced, etc.
  this.lastAdded = 0;
  this.classifier = new ApparatusLogisticRegressionWorkersClassifier(
    this.numWorkers,
    this.onProgress
  );
  return Classifier.prototype.train.call(this);
}

LogisticRegressionWorkersClassifier.prototype.train = train;
LogisticRegressionWorkersClassifier.restore = restore;
LogisticRegressionWorkersClassifier.load = load;

module.exports = LogisticRegressionWorkersClassifier;
