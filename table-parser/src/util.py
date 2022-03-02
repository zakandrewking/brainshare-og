import re


def increment(name: str) -> str:
    """Increment a file name with (#)"""
    match = re.match(r"(.*?)( \(\d+\))?(\.[\w]+)", name)
    if match is None:
        return name
    first, num, last = match.groups()
    num_int = int(num[2:-1]) + 1 if num else 1
    print(name, "|", first, "|", num_int, "|", last)
    return f"{first} ({num_int}){last}"
