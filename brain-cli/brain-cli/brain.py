import typer


def main(name: str) -> None:
    typer.echo(f"Hello {name}")


def eject() -> None:
    typer.echo("Not implemented")


if __name__ == "__main__":
    typer.run(main)
