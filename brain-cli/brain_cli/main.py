import typer

app = typer.Typer()


@app.command()
def main(name: str) -> None:
    typer.echo(f"Hello {name}")


@app.command()
def eject() -> None:
    typer.echo("Not implemented")
