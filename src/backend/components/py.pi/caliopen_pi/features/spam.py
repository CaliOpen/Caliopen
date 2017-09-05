# -*- coding: utf-8 -*-
"""Caliopen spam score extraction methods."""
from __future__ import absolute_import, print_function, unicode_literals

import re
import logging

log = logging.getLogger(__name__)


def extract_mail_spam_scores(mail):
    """Extract different spam scores from mail."""
    scores = {}
    score = mail.get('X-Spam-Score', 0)
    if score:
        try:
            score = float(score)
            scores['score'] = score
        except TypeError:
            log.debug('Invalid type for X-Spam-Score value {}'.
                      format(score))
    level = mail.get('X-Spam-Level', '')
    if '*' in level:
        # SpamAssassin style, level is *** notation, up to 25 *
        scores['level'] = level.count('*')
    status = mail.get('X-Spam-Status', '')
    if status:
        match = re.match('^(.*), score=(\d.\d).*', status)
        if match:
            flag = match.groups()[0]
            scores['status_score'] = float(match.groups()[1])
            if flag.lower().startswith('y'):
                scores['flag'] = True
            else:
                scores['flag'] = False

    flag = mail.get('X-Spam-Flag', '')
    if flag.lower().startswith('y'):
        scores['flag'] = True

    return scores


class SpamScorer(object):
    """Class to compute a spam score for a message."""

    is_spam = False
    score = 0.0
    method = ''
    source_flag = ''

    def __init__(self, mail):
        """Compute a global score using multiple methods and mail."""
        self.scores = extract_mail_spam_scores(mail)
        log.debug('Found spam scores {s}'.format(s=self.scores))
        if 'level' in self.scores:
            self.method = 'level'
            self.score = min(100.0, self.scores['level'] * 4.0)
        if 'score' in self.scores:
            self.method = 'score'
            self.score = min(0.0, self.scores['score']) * 10.0
        if 'status_score' in self.scores:
            self.method = 'status'
            if self.scores['status_score'] < 2.0:
                self.score = 0.0
            else:
                tmp_score = min(100.0, self.scores['status_score'] * 10)
                self.score = max(0.0, tmp_score)
        if self.scores.get('flag'):
            self.is_spam = True
            self.source_flag = self.scores['flag']
        if not self.is_spam and self.score >= 50:
            self.is_spam = True
