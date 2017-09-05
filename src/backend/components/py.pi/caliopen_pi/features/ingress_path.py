# -*- coding: utf-8 -*-
"""
A kind of algorithm to parse SMTP Received headers.

Extract some privacy features about an eventual detected ingress SMTP server
and number of external hops from an SMTP relay path.

It's far from perfect as so many format and practices exists around Received
headers, and off course also a relative trust about them.
"""
from __future__ import absolute_import, print_function, unicode_literals

import re
import logging

log = logging.getLogger(__name__)


def normalize_ssocket_infos(socket_info, cipher):
    """Normalize tls information from a Received header."""
    if socket_info:
        tls_version = socket_info.replace('_', '.').lower()
    else:
        tls_version = ''
    return tls_version, cipher


def get_ingress_features(headers, internal_domains=None):
    """Try to find information about ingress server that send this mail."""
    internal_domains = internal_domains if internal_domains else []

    def get_host(line):
        if ' ' not in line:
            return None
        parts = line.split(' ')
        return parts[0]

    def parse_ingress(header):
        """Parse detected ingress header to find encryption infos."""
        header = header.replace('\n', '')
        # XXX to complete but MUST match with tls_version, cipher groups
        searches = ['.*using (\S+) with cipher ([\S-]+)']
        for regex in searches:
            search = re.compile(regex, re.MULTILINE)
            match = search.match(header)
            if match:
                return match.groups()
        return None

    found_features = {}

    # First step Search for 'paths' (from / by) information
    search = re.compile(r'^from (.*) by (.*)', re.MULTILINE + re.DOTALL)
    paths = []
    for r in headers:
        r = r.replace('\n', '')
        match = search.match(r)
        if match:
            groups = match.groups()
            from_ = get_host(groups[0])
            by = get_host(groups[1])
            if from_ and by:
                paths.append((from_, by, groups))
            else:
                log.warn('Invalid from {} or by {} path in {}'.
                         format(from_, by, r))
        else:
            if r.startswith('by'):
                # XXX first hop, to consider ?
                pass
            else:
                log.warn('Received header, does not match format {}'.
                         format(r))

    # Second step: qualify path if internal and try to find the ingress one
    ingress = None
    internal_hops = 0
    for path in paths:
        is_internal = False
        for internal in internal_domains:
            if internal in path[0]:
                is_internal = True
            else:
                if internal in path[1]:
                    ingress = path
                    break
        if is_internal:
            internal_hops += 1

    # Qualify ingress connection
    if ingress:
        cnx_info = parse_ingress(ingress[2][0])
        if cnx_info and len(cnx_info) > 1:
            tls_version, cipher = normalize_ssocket_infos(cnx_info)
            found_features.update({'ingress_socket_version': tls_version,
                                   'ingress_cipher': cipher})
        found_features.update({'ingress_server': ingress[0]})

    # Try to count external hops
    external_hops = len(paths) - internal_hops
    found_features.update({'nb_external_hops': external_hops})
    return found_features
